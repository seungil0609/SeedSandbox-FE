import { atom } from 'jotai';
import { idTokenAtom } from '../auth/atoms';
import { SERVER_IP } from '../../constants/env';
import axios from 'axios';
import { AssetSearchResultAtom, SelectedAssetDetailDataAtom } from './atoms';

// 종목 상세 정보 조회
export const getSelectedAssetDetailDataAtom = atom(null, async (get, set, ticker: string) => {
    try {
        const token = get(idTokenAtom);
        const res = await axios.get(`${SERVER_IP}/api/assets/details/${ticker}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        set(SelectedAssetDetailDataAtom, res.data);
    } catch (error) {
        console.error('종목 상세 정보 조회 실패: ', error);
        throw new Error();
    }
});

// 종목 검색
export const getAssetSearchData = atom(null, async (get, set, assetName: string) => {
    try {
        const token = get(idTokenAtom);
        const res = await axios.get(`${SERVER_IP}/api/assets/search?q=${assetName}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        set(AssetSearchResultAtom, res.data);
    } catch (error) {
        console.error('종목 검색 실패: ', error);
        throw new Error();
    }
});
