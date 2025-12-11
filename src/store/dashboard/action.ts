import { atom } from 'jotai';
import { idTokenAtom } from '../auth/atoms';
import axios from 'axios';
import { SERVER_IP } from '../../constants/env';
import { selectedPortfolioIdAtom } from '../portfolios/atoms';
import {
    PortfolioAIReviewAnswerAtom,
    portfolioChartData,
    portfolioChartIndexData,
    PortfolioDashboardAtom,
    PortfolioRiskAtom,
} from './atoms';

export const getPortfolioRiskDataAtom = atom(null, async (get, set, marketName: string) => {
    try {
        const token = get(idTokenAtom);
        const portfolioId = get(selectedPortfolioIdAtom);
        const res = await axios.get(
            `${SERVER_IP}/api/analytics/risk/${portfolioId}?benchmark=${marketName}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        set(PortfolioRiskAtom, res.data);
    } catch (error) {
        console.error('포트폴리오 리스크 데이터 조회 실패: ', error);
        throw new Error();
    }
});

export const getPortfolioDashboardDataAtom = atom(null, async (get, set) => {
    try {
        const token = get(idTokenAtom);
        const portfolioId = get(selectedPortfolioIdAtom);
        const res = await axios.get(`${SERVER_IP}/api/portfolios/${portfolioId}/summary`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        set(PortfolioDashboardAtom, res.data);
    } catch (error) {
        console.error('포트폴리오 리스크 데이터 조회 실패: ', error);
        throw new Error();
    }
});

/** 포트폴리오 차트 데이터 */
export const getPortfolioChartDataAtom = atom(
    null,
    async (get, set, range: string, interval: string) => {
        try {
            const token = get(idTokenAtom);
            const portfolioId = get(selectedPortfolioIdAtom);

            const res = await axios.get(
                `${SERVER_IP}/api/portfolios/${portfolioId}/chart?range=${range}&interval=${interval}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            set(portfolioChartData, res.data);
        } catch (error) {
            console.error('Failed to fetch portfolios:', error);
            throw new Error();
        }
    }
);

export const getPortfolioChartIndexDataAtom = atom(
    null,
    async (get, set, range: string, interval: string, marketName: string) => {
        try {
            const token = get(idTokenAtom);
            const portfolioId = get(selectedPortfolioIdAtom);

            const res = await axios.get(
                `${SERVER_IP}/api/market-index/${marketName}?portfolioId=${portfolioId}&range=${range}&interval=${interval}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            set(portfolioChartIndexData, res.data);
        } catch (error) {
            console.error('시장 지수 차트 데이터 가져오기 에러:', error);
            throw new Error();
        }
    }
);

/** 포트폴리오 AI 분석 요약 */
export const getPortfolioAIReviewAtom = atom(null, async (get, set) => {
    try {
        const token = get(idTokenAtom);
        const portfolioId = get(selectedPortfolioIdAtom);

        const res = await axios.get(`${SERVER_IP}/api/ai/summary/${portfolioId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        set(PortfolioAIReviewAnswerAtom, res.data.summary);
    } catch (error) {
        console.error('포트폴리오 AI 분석 데이터 가져오기 에러:', error);
        throw new Error();
    }
});
