import { atom } from "jotai";
import axios from "axios";
import { idTokenAtom } from "../auth/atoms";
import { SERVER_IP } from "../../constants/env";
import {
  allPortfolios,
  portfolioItems,
  selectedPortfolio,
  selectedPortfolioIdAtom,
  type PortfolioData,
} from "./atoms";
import { RESET } from "jotai/utils";

// 🟢 [추가됨] 거래내역 갱신을 위해 import
import { getAllTransactionAtom } from "../transaction/action";
import { AllTransactionAtom } from "../transaction/atom";

/** 포트폴리오의 종목 불러오기 */
export const getPortfolioById = atom(null, async (get, set) => {
  try {
    const token = get(idTokenAtom);
    const res = await axios.get(`${SERVER_IP}/api/portfolios`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set(allPortfolios, res.data);
  } catch (error) {
    console.error("Failed to fetch portfolios:", error);
    throw new Error();
  }
});

// 포트폴리오 모두 가져오기
export const getAllPortfoliosAtom = atom(null, async (get, set) => {
  try {
    const token = get(idTokenAtom);
    const res = await axios.get(`${SERVER_IP}/api/portfolios`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const portfolios = res.data;
    set(allPortfolios, portfolios);

    // 🟢 [추가된 안전장치]
    // 현재 선택된 ID가 유효한지 검사
    const currentId = get(selectedPortfolioIdAtom);

    if (Array.isArray(portfolios) && portfolios.length > 0) {
      // 목록은 있는데...
      const isValid = portfolios.find((p: any) => p._id === currentId);

      // 1. 선택된 ID가 없거나 (null)
      // 2. 선택된 ID가 목록에 없다면 (삭제됨/유령ID)
      // -> 첫 번째 포트폴리오를 강제로 선택
      if (!currentId || !isValid) {
        set(selectedPortfolioIdAtom, portfolios[0]._id);
      }
    } else {
      // 목록이 아예 없으면 선택 해제
      set(selectedPortfolioIdAtom, null);
    }
  } catch (error) {
    console.error("Failed to fetch portfolios:", error);
    throw new Error();
  }
});

export const getPortfolioItemsByIdAtom = atom(
  null,
  async (get, set, portfolioId: string) => {
    try {
      const token = get(idTokenAtom);
      const res = await axios.get(
        `${SERVER_IP}/api/portfolios/${portfolioId}/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      set(portfolioItems, res.data.assets);
    } catch (error) {
      console.error("포트폴리오 조회 실패: ", error);
      throw new Error();
    }
  }
);

// 개별 포트폴리오 조회, 수정, 삭제

// 수정
export const postPortfolioByIdAtom = atom(
  null,
  async (get, set, portfolioId: string, data: PortfolioData) => {
    try {
      const token = get(idTokenAtom);
      const res = await axios.post(
        `${SERVER_IP}/api/portfolios/${portfolioId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      set(selectedPortfolio, res.data);
    } catch (error) {
      console.error("포트폴리오 조회 실패: ", error);
      throw new Error();
    }
  }
);

// 삭제 (수정됨: atomWithStorage 대응)
export const deleteCurrentPortfolioAtom = atom(null, async (get, set) => {
  try {
    const token = get(idTokenAtom);
    const portfolioId = get(selectedPortfolioIdAtom);

    if (!portfolioId) return;

    // 1. 서버 삭제 요청
    await axios.delete(`${SERVER_IP}/api/portfolios/${portfolioId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 2. 전체 포트폴리오 목록 다시 불러오기
    await set(getAllPortfoliosAtom);

    // 3. 갱신된 목록 확인 후 처리
    const portfolios = get(allPortfolios);

    if (Array.isArray(portfolios) && portfolios.length > 0) {
      // A. 남은 포트폴리오가 있는 경우 -> 다음 포트폴리오로 갈아타기
      const nextId = portfolios[0]._id;
      set(selectedPortfolioIdAtom, nextId);

      // 데이터 갱신
      await set(getPortfolioItemsByIdAtom, nextId); // 자산 목록 갱신
      await set(getAllTransactionAtom); // 🟢 [추가] 거래내역도 갱신!
    } else {
      // B. 남은 포트폴리오가 없는 경우 -> 싹 비우기
      set(selectedPortfolioIdAtom, null);
      set(portfolioItems, []);
      set(selectedPortfolio, null);
      set(AllTransactionAtom, null); // 🟢 [추가] 거래내역 화면 비우기
    }
  } catch (error) {
    console.error("포트폴리오 삭제 실패: ", error);
    throw new Error();
  }
});

/** 포트폴리오 생성 */
export const createNewPortfolioAtom = atom(
  null,
  async (get, set, portfolioName: string, portfolioCurrency: string) => {
    try {
      const token = get(idTokenAtom);

      const data = {
        name: portfolioName,
        baseCurrency: portfolioCurrency,
      };

      const res = await axios.post(`${SERVER_IP}/api/portfolios`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.status;
    } catch (error) {
      console.error("Failed to fetch portfolios:", error);
      throw new Error();
    }
  }
);

// 선택 (수정됨: localStorage 직접 제어 제거 -> atomWithStorage가 알아서 함)
export const setCurrentPortfolioAtom = atom(
  null,
  async (get, set, portfolioId: string) => {
    set(selectedPortfolioIdAtom, portfolioId);
  }
);
