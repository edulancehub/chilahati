"use client";

import type { User } from "firebase/auth";

export async function exchangeFirebaseSession(firebaseUser: User) {
    const idToken = await firebaseUser.getIdToken();

    const res = await fetch("/api/auth/firebase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
    }

    return data;
}