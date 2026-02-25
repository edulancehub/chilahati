import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-me");
const COOKIE_NAME = "session-token";

export interface SessionPayload {
    userId: string;
    username: string;
    email: string;
    role: "admin" | "supervisor" | "user";
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
    return new SignJWT(payload as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}

export async function setSessionCookie(payload: SessionPayload) {
    const token = await createSessionToken(payload);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24h
        path: "/",
    });
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
}

/** Middleware helper: read session from request without `cookies()` */
export function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) return Promise.resolve(null);
    return verifySessionToken(token);
}

/** Guard: return 401 response if not authenticated */
export async function requireAuth(): Promise<SessionPayload> {
    const session = await getSession();
    if (!session) {
        throw new Error("UNAUTHORIZED");
    }
    return session;
}

/** Guard: return 403 if not staff (admin/supervisor) */
export async function requireStaff(): Promise<SessionPayload> {
    const session = await requireAuth();
    if (session.role !== "admin" && session.role !== "supervisor") {
        throw new Error("FORBIDDEN");
    }
    return session;
}

/** Helper for API routes: wrap auth errors to proper responses */
export function authErrorResponse(err: unknown): NextResponse {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg === "UNAUTHORIZED") {
        return NextResponse.json({ error: "Please log in" }, { status: 401 });
    }
    if (msg === "FORBIDDEN") {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
}
