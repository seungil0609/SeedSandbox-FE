import { atom } from "jotai";

export interface Portfolio {
  _id: string;
  user: string;
  name: string;
  baseCurrency: string;
  createdAt: string;
}

export interface PortfolioItem {
  ticker: string;
  name: string;
  sector: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  totalValue: number;
  returnRate: number;
}

export interface PortfolioData {
  name: string;
  baseCurrency: string;
}

export const allPortfolios = atom<Portfolio[]>([]);

export const portfolioItems = atom<PortfolioItem[]>([]);

export const selectedPortfolio = atom<PortfolioData | null>(null);

// ▼ 수정됨: localStorage에서 값을 가져오지 않고, 항상 null로 시작합니다.
// 이렇게 하면 로컬 개발 때 쓰던 '유령 ID'가 배포 환경에서 로드되는 것을 막을 수 있습니다.
export const selectedPortfolioIdAtom = atom<string | null>(null);
