import { atom } from 'jotai';
import axios from 'axios';
import { idTokenAtom } from '../auth/atoms';
import { SERVER_IP } from '../../constants/env';
import { selectedPortfolioIdAtom } from '../portfolios/atoms';
import { AllTransactionAtom } from './atom';

export const postTransactionAtom = atom(
    null,
    async (
        get,
        set,
        assetTicker: string,
        transactionType: string,
        quantity: number,
        price: number,
        currency: string,
        transactionDate: string
    ) => {
        try {
            const token = get(idTokenAtom);
            const portfoliioId = get(selectedPortfolioIdAtom);
            const data = {
                assetTicker: assetTicker,
                transactionType: transactionType,
                quantity: quantity,
                price: price,
                currency: currency,
                transactionDate: transactionDate,
            };
            const res = await axios.post(
                `${SERVER_IP}/api/portfolios/${portfoliioId}/transactions`,
                data,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return res.status;
        } catch (error) {
            console.error('거래내역 저장 에러:', error);
            throw new Error();
        }
    }
);

export const getAllTransactionAtom = atom(null, async (get, set) => {
    try {
        const token = get(idTokenAtom);
        const portfoliioId = get(selectedPortfolioIdAtom);

        const res = await axios.get(`${SERVER_IP}/api/portfolios/${portfoliioId}/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        set(AllTransactionAtom, res.data);
    } catch (error) {
        console.error('거래내역 저장 에러:', error);
        throw new Error();
    }
});

export const deleteTransactionByIdAtom = atom(null, async (get, set, transactionId: string) => {
    try {
        const token = get(idTokenAtom);

        await axios.delete(`${SERVER_IP}/api/transactions/${transactionId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        await set(getAllTransactionAtom);
    } catch (error) {
        console.error('거래내역 저장 에러:', error);
        throw new Error();
    }
});
