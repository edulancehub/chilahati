import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAuth, authErrorResponse, setSessionCookie } from "@/lib/auth";

// POST: Update username
export async function POST(req: NextRequest) {
    try {
        const session = await requireAuth();
        await dbConnect();
        const { newUsername, password } = await req.json();

        if (!newUsername || !password) {
            return NextResponse.json({ error: "Please provide both username and password" }, { status: 400 });
        }
        if (newUsername.length < 3 || newUsername.length > 30) {
            return NextResponse.json({ error: "Username must be 3-30 characters" }, { status: 400 });
        }

        const currentUser = await User.findById(session.userId);
        if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const isMatch = await bcrypt.compare(password, currentUser.password);
        if (!isMatch) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

        if (newUsername === currentUser.username) {
            return NextResponse.json({ error: "New username is the same as current" }, { status: 400 });
        }

        const existingUser = await User.findOne({
            username: { $regex: new RegExp(`^${newUsername}$`, "i") },
            _id: { $ne: currentUser._id },
        });
        if (existingUser) return NextResponse.json({ error: "Username is already taken" }, { status: 409 });

        currentUser.username = newUsername;
        await currentUser.save();

        // Update session cookie with new username
        await setSessionCookie({
            userId: session.userId,
            username: newUsername,
            email: session.email,
            role: session.role,
        });

        return NextResponse.json({ success: true, message: "Username updated successfully!" });
    } catch (err) {
        return authErrorResponse(err);
    }
}
