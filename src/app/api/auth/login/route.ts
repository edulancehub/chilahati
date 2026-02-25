import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "That email is not registered" }, { status: 401 });
        }

        if (!user.isVerified) {
            return NextResponse.json({ error: "NOT_VERIFIED", email }, { status: 403 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Password incorrect" }, { status: 401 });
        }

        // Set JWT cookie
        await setSessionCookie({
            userId: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
        });

        return NextResponse.json({ success: true, user: { username: user.username, role: user.role } });
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
