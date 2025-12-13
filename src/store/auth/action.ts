import { atom } from "jotai";
import axios from "axios";
import { SERVER_IP } from "../../constants/env";
import { idTokenAtom, isAuthenticatedAtom, UserProfileAtom } from "./atoms";
import { RESET } from "jotai/utils";

// 👇 초기화할 Atom들을 가져옵니다.
import {
  allPortfolios,
  portfolioItems,
  selectedPortfolio,
  selectedPortfolioIdAtom,
} from "../portfolios/atoms";
import {
  PortfolioAIReviewAnswerAtom,
  portfolioChartData,
  portfolioChartIndexData,
  PortfolioDashboardAtom,
  PortfolioRiskAtom,
} from "../dashboard/atoms";
import { AllTransactionAtom } from "../transaction/atom";

/** 회원 가입 */
export const register = atom(
  null,
  async (
    get,
    set,
    params: { firebaseUid: string; email: string; nickName: string }
  ) => {
    try {
      const data = {
        firebaseUid: params.firebaseUid,
        email: params.email,
        nickname: params.nickName,
      };
      await axios.post(`${SERVER_IP}/api/users/register`, data);
    } catch (error) {
      console.error("회원가입 실패: ", error);
      throw new Error();
    }
  }
);

/** 회원 탈퇴 */
export const deleteAccount = atom(null, async (get, set) => {
  try {
    const token = get(idTokenAtom);
    await axios.delete(`${SERVER_IP}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // 탈퇴 성공 시에도 로그아웃과 동일하게 상태 초기화 수행
    await set(signOut);
  } catch (error) {
    console.error("회원 탈퇴 실패: ", error);
    throw new Error();
  }
});

/** 로그아웃 (상태 초기화 포함) */
export const signOut = atom(null, async (get, set) => {
  try {
    const token = get(idTokenAtom);

    // 1. 서버 로그아웃 요청 (선택 사항)
    if (token) {
      try {
        await axios.post(`${SERVER_IP}/api/users/logout`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.warn("서버 로그아웃 실패 (무시됨)", e);
      }
    }

    // 2. 인증 관련 상태 초기화
    set(idTokenAtom, null);
    set(isAuthenticatedAtom, false);
    set(UserProfileAtom, null);

    // 3. 🧹 [핵심] 데이터 관련 상태 싹 다 비우기 (청소)
    // 포트폴리오
    set(allPortfolios, []);
    set(portfolioItems, []);
    set(selectedPortfolio, null);
    // 🟢 [수정됨] atomWithStorage는 RESET 심볼을 보내면 초기값(null)으로 돌아가고 스토리지도 정리됨
    set(selectedPortfolioIdAtom, RESET);
    localStorage.removeItem("selectedPortfolio"); // 로컬스토리지도 삭제

    // 대시보드
    set(PortfolioRiskAtom, null);
    set(PortfolioDashboardAtom, null);
    set(portfolioChartData, null);
    set(portfolioChartIndexData, null);
    set(PortfolioAIReviewAnswerAtom, null);

    // 거래내역
    set(AllTransactionAtom, null);
  } catch (error) {
    console.error("로그아웃 실패: ", error);
    // 에러가 나더라도 클라이언트 상태는 초기화해야 함
    set(idTokenAtom, null);
    set(isAuthenticatedAtom, false);
  }
});

/** 회원정보 조회 */
export const getProfileAtom = atom(null, async (get, set) => {
  try {
    const token = get(idTokenAtom);
    if (!token) return; // 토큰 없으면 요청 안 함
    const res = await axios.get(`${SERVER_IP}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set(UserProfileAtom, res.data);
  } catch (error) {
    console.error("유저 정보 조회 실패: ", error);
    throw new Error();
  }
});
