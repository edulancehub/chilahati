import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-change-me");

const protectedRoutes = ["/profile", "/contribute"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("session")?.value;

    let session: { role?: string } | null = null;
    if (token) {
        try {
            const { payload } = await jwtVerify(token, secret);
            session = payload as { role?: string };
        } catch {
            // Invalid token — treat as unauthenticated
        }
    }

    // Redirect authenticated users away from auth pages
    if (authRoutes.some((r) => pathname.startsWith(r)) && session) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Protect user routes
    if (protectedRoutes.some((r) => pathname.startsWith(r)) && !session) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    // Protect admin routes
    if (adminRoutes.some((r) => pathname.startsWith(r))) {
        if (!session) {
            const url = new URL("/login", request.url);
            url.searchParams.set("redirect", pathname);
            return NextResponse.redirect(url);
        }
        if (session.role !== "admin" && session.role !== "supervisor") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile/:path*", "/contribute/:path*", "/admin/:path*", "/login", "/register"],
};
