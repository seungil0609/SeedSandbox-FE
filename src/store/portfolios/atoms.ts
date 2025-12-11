import { atom } from 'jotai';

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

export const selectedPortfolioIdAtom = atom<string | null>(
    typeof window !== 'undefined' && localStorage.getItem('selectedPortfolio')
        ? localStorage.getItem('selectedPortfolio')!
        : null
);
