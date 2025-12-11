import { atom } from 'jotai';

export interface Profile {
    _id: string;
    firebaseUid: string;
    email: string;
    nickname: string;
    createdAt: string;
}

export interface ProfileBasic {
    id: string;
    email: string;
    nickname: string;
    createdAt: string;
}

/** Firebase ID 토큰 */
export const idTokenAtom = atom<string | null>(null);

/** 로그인 상태 */
export const isAuthenticatedAtom = atom<boolean | undefined>(undefined);

/** 사용자 프로파일 */
export const UserProfileAtom = atom<ProfileBasic | null>(null);
