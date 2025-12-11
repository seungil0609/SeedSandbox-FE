import { initializeApp } from 'firebase/app';
import { getAuth, onIdTokenChanged } from 'firebase/auth';
import {
    FIREBASE_API_KEY,
    FIREBASE_APP_ID,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_MEASUREMENT_ID,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
} from '../../constants/env';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { idTokenAtom, isAuthenticatedAtom } from './atoms';

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
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                setToken(token);
                setAuth(true);
            } else {
                setToken(null);
                setAuth(false);
            }
        });
        return () => unsubscribe();
    }, []);
}
