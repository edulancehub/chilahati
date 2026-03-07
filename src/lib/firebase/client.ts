"use client";

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function getFirebaseApp() {
    if (typeof window === "undefined") {
        throw new Error("Firebase client auth can only run in the browser.");
    }

    if (!app) {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    }

    return app;
}

export function getFirebaseClientAuth() {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
        void setPersistence(auth, browserLocalPersistence).catch(() => {
            // Persistence falls back automatically if unavailable.
        });
    }

    return auth;
}

export function getGoogleProvider() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return provider;
}