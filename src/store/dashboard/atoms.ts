import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
// 🟢 [추가] 개별 자산 리스트를 가져오기 위해 import (경로 확인 필요)
import { portfolioItems } from "../portfolios/atoms";

// 🟢 [추가] 환율 상수 (1 USD = 1450 KRW 가정)
export const EXCHANGE_RATE = 1450;

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

export const dashboardMarketIndexAtom = atomWithStorage<string>(
  "dashboardMarketIndex",
  "sp500"
);

export const dashboardRangeAtom = atomWithStorage<string>(
  "dashboardRange",
  "7d"
);

// 🟢 [핵심 수정] 총 자산 가치를 아이템 리스트에서 직접 재계산하는 로직
export const PortfolioTotalsAtom = atom((get) => {
  const d = get(PortfolioDashboardAtom);
  const items = get(portfolioItems); // 현재 선택된 포트폴리오의 자산 리스트

  if (!d) return null;

  // 자산 리스트가 없으면 기존 대시보드 데이터 반환
  if (!items || items.length === 0) {
    return {
      baseCurrency: d.baseCurrency,
      totalPortfolioValue: d.totalPortfolioValue,
      totalPortfolioCostBasis: d.totalPortfolioCostBasis,
      totalPortfolioProfitLoss: d.totalPortfolioProfitLoss,
      totalPortfolioReturnPercentage: d.totalPortfolioReturnPercentage,
    };
  }

  // 1. 기준 통화 확인
  const baseCurrency = d.baseCurrency; // 'USD' or 'KRW'

  // 2. 총 자산 가치 재계산 (현재가 기준)
  const calculatedTotalValue = items.reduce((sum, item) => {
    let itemValue = item.currentPrice * item.quantity;
    const itemCurrency = item.currency; // 자산의 통화 ('KRW', 'USD' ...)

    // 환율 적용 로직
    if (baseCurrency === "USD" && itemCurrency === "KRW") {
      itemValue = itemValue / EXCHANGE_RATE; // 원화 자산을 달러로 (나누기)
    } else if (baseCurrency === "KRW" && itemCurrency === "USD") {
      itemValue = itemValue * EXCHANGE_RATE; // 달러 자산을 원화로 (곱하기)
    }
    // 통화가 같거나(USD-USD) 그 외의 경우 그대로 합산
    return sum + itemValue;
  }, 0);

  // 3. 총 매수 원금 재계산 (평균단가 기준)
  const calculatedTotalCost = items.reduce((sum, item) => {
    let itemCost = item.averagePrice * item.quantity;
    const itemCurrency = item.currency;

    if (baseCurrency === "USD" && itemCurrency === "KRW") {
      itemCost = itemCost / EXCHANGE_RATE;
    } else if (baseCurrency === "KRW" && itemCurrency === "USD") {
      itemCost = itemCost * EXCHANGE_RATE;
    }
    return sum + itemCost;
  }, 0);

  // 4. 수익금 및 수익률 재계산
  const calculatedProfitLoss = calculatedTotalValue - calculatedTotalCost;
  const calculatedReturnRate =
    calculatedTotalCost === 0
      ? 0
      : (calculatedProfitLoss / calculatedTotalCost) * 100;

  return {
    baseCurrency: baseCurrency,
    totalPortfolioValue: calculatedTotalValue, // 🟢 재계산된 총 자산
    totalPortfolioCostBasis: calculatedTotalCost, // 🟢 재계산된 원금
    totalPortfolioProfitLoss: calculatedProfitLoss, // 🟢 재계산된 수익금
    totalPortfolioReturnPercentage: calculatedReturnRate, // 🟢 재계산된 수익률
  };
});
