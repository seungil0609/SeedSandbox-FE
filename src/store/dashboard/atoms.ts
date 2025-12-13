import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface PortfolioRiskData {
  metrics: {
    volatility: number;
    beta: number;
    maxDrawdown: number;
    sharpeRatio: number;
    correlationMatrix: {
      [symbol: string]: {
        [symbol: string]: number;
      };
    };
  };
  benchmark: {
    symbol: string;
    name: string;
    volatility: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
}

export interface PortfolioDashboardData {
  portfolioId: string;
  name: string;
  baseCurrency: string;
  exchangeRate: number;
  totalPortfolioValue: number;
  totalPortfolioCostBasis: number;
  totalPortfolioProfitLoss: number;
  totalPortfolioReturnPercentage: number;
}

export interface PortfolioHistoricalChartData {
  historicalChartData: { date: string; value: number }[];
}

export interface PortfolioIndexChartData {
  index: string;
  symbol: string;
  portfolioId: string;
  interval: string;
  range: string;
  startDate: string;
  endDate: string;
  data: { date: string; value: number }[];
}

export const PortfolioRiskAtom = atom<PortfolioRiskData | null>(null);
export const PortfolioDashboardAtom = atom<PortfolioDashboardData | null>(null);
export const portfolioChartData = atom<PortfolioHistoricalChartData | null>(
  null
);
export const portfolioChartIndexData = atom<PortfolioIndexChartData | null>(
  null
);
export const PortfolioAIReviewAnswerAtom = atom<string | null>(null);

// 🟢 [수정됨] 대시보드 비교 지수 저장 (기본값: sp500)
export const dashboardMarketIndexAtom = atomWithStorage<string>(
  "dashboardMarketIndex",
  "sp500"
);

// 🟢 [추가됨] 대시보드 기간 저장 (기본값: 7d)
export const dashboardRangeAtom = atomWithStorage<string>(
  "dashboardRange",
  "7d"
);

export const PortfolioTotalsAtom = atom((get) => {
  const d = get(PortfolioDashboardAtom);
  if (!d) return null;
  return {
    baseCurrency: d.baseCurrency,
    totalPortfolioValue: d.totalPortfolioValue,
    totalPortfolioCostBasis: d.totalPortfolioCostBasis,
    totalPortfolioProfitLoss: d.totalPortfolioProfitLoss,
    totalPortfolioReturnPercentage: d.totalPortfolioReturnPercentage,
  };
});
