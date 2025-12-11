import { atom } from 'jotai';

export interface AssetMeta {
    symbol: string;
    shortName: string;
    longName: string;
    exchange: string;
    currency: string;
    assetType: string;
    regularMarketPrice: number;
    regularMarketChange: number;
    regularMarketChangePercent: number;
    regularMarketTime: string;
    sector: string;
}

export interface AssetFundamentals {
    marketCap: number;
    trailingPE: number;
    forwardPE: number;
    priceToBook: number;
    eps: number;
    profitMargins: number;
    totalRevenue: number;
    totalCash: number;
    totalDebt: number;
    dividendYield: number;
    beta: number;
    targetPrice: number;
    recommendationKey: string;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    volume: number;
}

export interface AssetNews {
    title: string;
    link: string;
    publisher: string;
    providerPublishTime: string;
    thumbnail: string;
}

export interface AssetChartData {
    date: string;
    close: number;
    volume: number;
}

export interface AssetDetailData {
    meta: AssetMeta;
    fundamentals: AssetFundamentals;
    chartData: AssetChartData[];
    news: AssetNews[];
}

export interface AssetSearch {
    symbol: string;
    shortname: string;
    exchange: string;
    typeDisp: string;
}

export const SelectedAssetDetailDataAtom = atom<AssetDetailData | null>(null);
export const AssetSearchResultAtom = atom<AssetSearch[] | null>(null);
export const SearchKeywordAtom = atom<string | null>(null);
