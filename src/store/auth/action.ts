import { atom } from "jotai";
import axios from "axios";
import { SERVER_IP } from "../../constants/env";
import { idTokenAtom, isAuthenticatedAtom, UserProfileAtom } from "./atoms";
import { signOut as firebaseSignOut } from "firebase/auth"; // Firebase 로그아웃 함수
import { auth } from "./firebase"; // Firebase 인증 객체

/** 회원 가입 */
export const register = atom(
  null,
  async (
    get,
    set,
    params: { firebaseUid: string; email: string; nickName: string }
  ) => {
    try {
      const data = {
        firebaseUid: params.firebaseUid,
        email: params.email,
        nickname: params.nickName,
      };
      await axios.post(`${SERVER_IP}/api/users/register`, data);
    } catch (error) {
      console.error("회원가입 실패: ", error);
      throw new Error();
    }
  }
);

/** 회원 탈퇴 */
export const deleteAccount = atom(null, async (get, set) => {
  try {
    const token = get(idTokenAtom);
    await axios.delete(`${SERVER_IP}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 탈퇴 후 로그아웃 처리와 동일하게 정리
    await firebaseSignOut(auth);
    set(idTokenAtom, null);
    set(isAuthenticatedAtom, false);
    set(UserProfileAtom, null);
    localStorage.clear();
  } catch (error) {
    console.error("회원 탈퇴 실패: ", error);
    throw new Error();
  }
});

/** 로그아웃 (수정됨) */
export const signOut = atom(null, async (get, set) => {
  try {
    const token = get(idTokenAtom);

    // 1. 백엔드 로그아웃 요청 (토큰 무효화 등)
    // 백엔드가 죽어있어도 프론트 로그아웃은 되어야 하므로 try-catch 분리 가능
    if (token) {
      await axios.post(`${SERVER_IP}/api/users/logout`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (error) {
    console.warn("백엔드 로그아웃 요청 실패 (무시하고 진행): ", error);
  } finally {
    // 2. 🚨 Firebase 세션 종료 (가장 중요)
    await firebaseSignOut(auth);

    // 3. 상태(Atom) 초기화
    set(idTokenAtom, null);
    set(isAuthenticatedAtom, false);
    set(UserProfileAtom, null);

    // 4. 로컬 스토리지 정리 (포트폴리오 ID 등)
    localStorage.clear();
  }
});

/** 회원정보 조회 */
export const getProfileAtom = atom(null, async (get, set) => {
  try {
    const token = get(idTokenAtom);
    if (!token) return; // 토큰 없으면 요청 안함

    const res = await axios.get(`${SERVER_IP}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set(UserProfileAtom, res.data);
  } catch (error) {
    console.error("유저 정보 조회 실패: ", error);
    // 에러 발생 시 로그아웃 처리는 하지 않음 (일시적 네트워크 오류일 수 있음)
  }
});
