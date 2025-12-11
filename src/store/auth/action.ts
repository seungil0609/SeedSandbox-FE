import { atom } from 'jotai';
import axios from 'axios';
import { SERVER_IP } from '../../constants/env';
import { idTokenAtom, UserProfileAtom } from './atoms';

/** 회원 가입 */
export const register = atom(
    null,
    async (get, set, params: { firebaseUid: string; email: string; nickName: string }) => {
        try {
            const data = {
                firebaseUid: params.firebaseUid,
                email: params.email,
                nickname: params.nickName,
            };
            await axios.post(`${SERVER_IP}/api/users/register`, data);
        } catch (error) {
            console.error('회원가입 실패: ', error);
            throw new Error();
        }
    }
);

/** 회원 탈퇴 */
export const deleteAccount = atom(null, async (get) => {
    try {
        const token = get(idTokenAtom);
        await axios.delete(`${SERVER_IP}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        console.error('회원 탈퇴 실패: ', error);
        throw new Error();
    }
});

/** 로그아웃 */
export const signOut = atom(null, async (get) => {
    try {
        const token = get(idTokenAtom);
        await axios.post(`${SERVER_IP}/api/users/logout`, null, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        console.error('로그아웃 실패: ', error);
        throw new Error();
    }
});

/** 회원정보 조회 */
export const getProfileAtom = atom(null, async (get, set) => {
    try {
        const token = get(idTokenAtom);
        const res = await axios.get(`${SERVER_IP}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        set(UserProfileAtom, res.data);
    } catch (error) {
        console.error('유저 정보 조회 실패: ', error);
        throw new Error();
    }
});
