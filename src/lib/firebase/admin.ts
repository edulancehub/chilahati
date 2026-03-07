import "server-only";

import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error("Firebase Admin environment variables are not configured.");
    }

    return initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
    });
}

export function getFirebaseAdminAuth() {
    return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb() {
    return getFirestore(getFirebaseAdminApp());
}