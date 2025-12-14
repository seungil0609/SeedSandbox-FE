import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// 🟢 [수정] 개별 자산 리스트 import 제거 (더 이상 필요 없음)
// import { portfolioItems } from "../portfolios/atoms";

// 🟢 [수정] 프론트엔드용 고정 환율 상수 제거 (백엔드 데이터 사용)
// export const EXCHANGE_RATE = 1450;

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
  // 🟢 [추가] 이 부분이 없어서 에러가 났었습니다.
  excluded?: string[];
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

export const dashboardMarketIndexAtom = atomWithStorage<string>(
  "dashboardMarketIndex",
  "sp500"
);

export const dashboardRangeAtom = atomWithStorage<string>(
  "dashboardRange",
  "7d"
);

// 🟢 [핵심 수정] 프론트엔드 재계산 로직 제거 -> 백엔드 데이터 그대로 반환
export const PortfolioTotalsAtom = atom((get) => {
  // 1. 백엔드에서 받아온 대시보드 데이터 (getPortfolioSummary 결과)
  const d = get(PortfolioDashboardAtom);

  if (!d) return null;

  // 2. 백엔드에서 이미 환율 계산된 정확한 값을 그대로 반환합니다.
  return {
    baseCurrency: d.baseCurrency,
    totalPortfolioValue: d.totalPortfolioValue,
    totalPortfolioCostBasis: d.totalPortfolioCostBasis,
    totalPortfolioProfitLoss: d.totalPortfolioProfitLoss,
    totalPortfolioReturnPercentage: d.totalPortfolioReturnPercentage,
  };
});
