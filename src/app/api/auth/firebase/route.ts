import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { resolveAuthProvider, syncFirebaseUser } from "@/lib/user-sync";

export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: "Missing Firebase ID token" }, { status: 400 });
        }

        const decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
        const email = decodedToken.email?.trim().toLowerCase();

        if (!email) {
            return NextResponse.json(
                { error: "Your Firebase account does not include an email address" },
                { status: 400 }
            );
        }

        const provider = resolveAuthProvider(decodedToken.firebase?.sign_in_provider);

        if (provider === "password" && !decodedToken.email_verified) {
            return NextResponse.json({ error: "NOT_VERIFIED" }, { status: 403 });
        }

        const user = await syncFirebaseUser({
            uid: decodedToken.uid,
            email,
            name: decodedToken.name,
            picture: decodedToken.picture,
            emailVerified: Boolean(decodedToken.email_verified),
            provider,
        });

        await setSessionCookie({
            userId: user.uid,
            username: user.username,
            email: user.email,
            role: user.role,
            provider: user.provider,
        });

        return NextResponse.json({
            success: true,
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                provider: user.provider,
            },
        });
    } catch (err) {
        console.error("Firebase session error:", err);
        return NextResponse.json({ error: "Unable to authenticate with Firebase" }, { status: 500 });
    }
}
