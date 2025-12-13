import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

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

// 🟢 [수정됨] atom -> atomWithStorage로 변경
// 첫 번째 인자: localStorage에 저장될 키 이름 ('selectedPortfolioId')
// 두 번째 인자: 초기값 (null)
export const selectedPortfolioIdAtom = atomWithStorage<string | null>(
  "selectedPortfolioId",
  null
);
