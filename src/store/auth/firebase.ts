import { initializeApp } from "firebase/app";
import {
  getAuth,
  onIdTokenChanged,
  signOut as firebaseSignOut,
} from "firebase/auth"; // signOut 이름 변경 충돌 방지
import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from "../../constants/env";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { idTokenAtom, isAuthenticatedAtom } from "./atoms";

const firebaseConfig = {
  apiKey: `${FIREBASE_API_KEY}`,
  authDomain: `${FIREBASE_AUTH_DOMAIN}`,
  projectId: `${FIREBASE_PROJECT_ID}`,
  storageBucket: `${FIREBASE_STORAGE_BUCKET}`,
  messagingSenderId: `${FIREBASE_MESSAGING_SENDER_ID}`,
  appId: `${FIREBASE_APP_ID}`,
  measurementId: `${FIREBASE_MEASUREMENT_ID}`,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export function useFirebaseAuth() {
  const setToken = useSetAtom(idTokenAtom);
  const setAuth = useSetAtom(isAuthenticatedAtom);

  useEffect(() => {
    // Firebase Auth 상태 변경 감지
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          // 토큰 강제 갱신 (선택사항, 백엔드 동기화 위해)
          const token = await user.getIdToken();
          setToken(token);
          setAuth(true);
        } catch (e) {
          console.error("Token fetch failed", e);
          setToken(null);
          setAuth(false);
        }
      } else {
        setToken(null);
        setAuth(false);
      }
    });
    return () => unsubscribe();
  }, [setToken, setAuth]);
}
