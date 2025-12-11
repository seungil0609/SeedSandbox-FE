import { atom } from 'jotai';
import axios from 'axios';
import { idTokenAtom } from '../auth/atoms';
import { SERVER_IP } from '../../constants/env';
import {
    allPortfolios,
    portfolioItems,
    selectedPortfolio,
    selectedPortfolioIdAtom,
    type PortfolioData,
} from './atoms';

/** 포트폴리오의 종목 불러오기 */
export const getPortfolioById = atom(null, async (get, set) => {
    try {
        const token = get(idTokenAtom);
        const res = await axios.get(`${SERVER_IP}/api/portfolios`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        set(allPortfolios, res.data);
    } catch (error) {
        console.error('Failed to fetch portfolios:', error);
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
        set(allPortfolios, res.data);
        // 첫번째 포트폴리오 요소의 _id를 로컬스토리지에 저장
        if (Array.isArray(res.data) && res.data.length > 0 && res.data[0]._id) {
            localStorage.setItem('selectedPortfolio', res.data[0]._id);
        }
    } catch (error) {
        console.error('Failed to fetch portfolios:', error);
        throw new Error();
    }
});

export const getPortfolioItemsByIdAtom = atom(null, async (get, set, portfolioId: string) => {
    try {
        const token = get(idTokenAtom);
        const res = await axios.get(`${SERVER_IP}/api/portfolios/${portfolioId}/summary`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        set(portfolioItems, res.data.assets);
    } catch (error) {
        console.error('포트폴리오 조회 실패: ', error);
        throw new Error();
    }
});

// 개별 포트폴리오 조회, 수정, 삭제

// 수정
export const postPortfolioByIdAtom = atom(
    null,
    async (get, set, portfolioId: string, data: PortfolioData) => {
        try {
            const token = get(idTokenAtom);
            const res = await axios.post(`${SERVER_IP}/api/portfolios/${portfolioId}`, data, {
                headers: { Authorization: `Bearer ${token}` },
            });
            set(selectedPortfolio, res.data);
        } catch (error) {
            console.error('포트폴리오 조회 실패: ', error);
            throw new Error();
        }
    }
);

// 삭제
// 현재 선택된 포트폴리오만 삭제 가능
export const deleteCurrentPortfolioAtom = atom(null, async (get, set) => {
    try {
        const token = get(idTokenAtom);
        const portfolioId = get(selectedPortfolioIdAtom);
        await axios.delete(`${SERVER_IP}/api/portfolios/${portfolioId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        await set(getAllPortfoliosAtom);

        const portfolios = get(allPortfolios);
        const nextId =
            Array.isArray(portfolios) && portfolios.length > 0 ? portfolios[0]._id : null;

        if (nextId) {
            localStorage.setItem('selectedPortfolio', nextId);
            set(selectedPortfolioIdAtom, nextId);
        } else {
            localStorage.removeItem('selectedPortfolio');
            set(selectedPortfolioIdAtom, '');
        }
    } catch (error) {
        console.error('포트폴리오 삭제 실패: ', error);
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
            console.error('Failed to fetch portfolios:', error);
            throw new Error();
        }
    }
);

/** 현재 포트폴리오 설정 */
export const setCurrentPortfolioAtom = atom(null, async (get, set, portfolioId: string) => {
    localStorage.setItem('selectedPortfolio', portfolioId);
    set(selectedPortfolioIdAtom, portfolioId);
});
