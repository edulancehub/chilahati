import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getUserByUid, getUserByEmail, getUserByUsername, upsertUser, UserRecord } from "@/lib/firestore";

type AuthProvider = "password" | "google";

interface SyncFirebaseUserInput {
    uid: string;
    email: string;
    name?: string;
    picture?: string;
    emailVerified: boolean;
    provider: AuthProvider;
}

function normalizeUsername(value: string): string {
    return (
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 24) || "chilahati-user"
    );
}

async function generateUniqueUsername(preferred: string, email: string): Promise<string> {
    const emailLocal = email.split("@")[0] || "chilahati-user";
    const base = normalizeUsername(preferred || emailLocal);
    let candidate = base;
    let suffix = 2;
    while (await getUserByUsername(candidate)) {
        candidate = `${base}-${suffix}`.slice(0, 30);
        suffix += 1;
    }
    return candidate;
}

export function resolveAuthProvider(signInProvider?: string): AuthProvider {
    return signInProvider === "google.com" ? "google" : "password";
}

function getAdminEmailSet(): Set<string> {
    return new Set(
        (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((v) => v.trim().toLowerCase())
            .filter(Boolean)
    );
}

export async function syncFirebaseUser(
    input: SyncFirebaseUserInput
): Promise<UserRecord & { uid: string }> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const adminEmails = getAdminEmailSet();
    const role: "admin" | "user" = adminEmails.has(normalizedEmail) ? "admin" : "user";

    const existing = await getUserByUid(input.uid);

    if (existing) {
        const updates: Record<string, unknown> = { email: normalizedEmail, provider: input.provider, role };
        if (input.picture) updates.avatarUrl = input.picture;
        if (input.emailVerified || input.provider === "google") updates.isVerified = true;
        await upsertUser(input.uid, updates);
        return { ...existing, ...updates, uid: input.uid } as UserRecord & { uid: string };
    }

    // Check if an account with this email already exists (e.g., email/password user signing in with Google)
    const existingByEmail = await getUserByEmail(normalizedEmail);
    if (existingByEmail) {
        const mergedData: Record<string, unknown> = {
            username: existingByEmail.username,
            email: normalizedEmail,
            role,
            provider: input.provider,
            avatarUrl: input.picture ?? existingByEmail.avatarUrl ?? null,
            isVerified: true,
            createdAt: existingByEmail.createdAt,
        };
        await upsertUser(input.uid, mergedData);
        return { ...existingByEmail, ...mergedData, uid: input.uid } as UserRecord & { uid: string };
    }

    // New user — generate unique username
    const username = await generateUniqueUsername(
        input.name || normalizedEmail,
        normalizedEmail
    );
    const newUser: Record<string, unknown> = {
        username,
        email: normalizedEmail,
        role,
        provider: input.provider,
        avatarUrl: input.picture ?? null,
        isVerified: input.emailVerified || input.provider === "google",
        createdAt: Timestamp.now(),
    };
    await upsertUser(input.uid, newUser);
    return { ...newUser, uid: input.uid } as unknown as UserRecord & { uid: string };
}
