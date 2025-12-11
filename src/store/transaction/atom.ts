import { atom } from 'jotai';

export interface Transaction {
    assetTicker: string;
    transactionType: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    currency: string;
    transactionDate: string;
}

export interface TransactionDetail {
    _id: string;
    portfolio: string;
    asset: {
        sectorWeights: Record<string, unknown>;
        _id: string;
        ticker: string;
        name: string;
        assetType: string;
        sector: string;
        __v: number;
    };
    transactionType: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    currency: string;
    transactionDate: string;
    __v: number;
}

export const AllTransactionAtom = atom<TransactionDetail[] | null>(null);
