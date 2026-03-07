import { NextRequest, NextResponse } from "next/server";
import { requireAuth, authErrorResponse, setSessionCookie } from "@/lib/auth";
import { getUserByUid, getUserByUsername, upsertUser } from "@/lib/firestore";

export async function POST(req: NextRequest) {
    try {
        const session = await requireAuth();
        const { newUsername } = await req.json();

        if (!newUsername) {
            return NextResponse.json({ error: "Please provide a new username" }, { status: 400 });
        }
        if (newUsername.length < 3 || newUsername.length > 30) {
            return NextResponse.json({ error: "Username must be 3-30 characters" }, { status: 400 });
        }

        const currentUser = await getUserByUid(session.userId);
        if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        if (newUsername === currentUser.username) {
            return NextResponse.json({ error: "New username is the same as current" }, { status: 400 });
        }

        const existingUser = await getUserByUsername(newUsername);
        if (existingUser && existingUser.uid !== session.userId) {
            return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
        }

        await upsertUser(session.userId, { username: newUsername });

        await setSessionCookie({
            userId: session.userId,
            username: newUsername,
            email: session.email,
            role: session.role,
            provider: session.provider,
        });

        return NextResponse.json({ success: true, message: "Username updated successfully!" });
    } catch (err) {
        return authErrorResponse(err);
    }
}
