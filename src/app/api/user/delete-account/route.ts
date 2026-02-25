import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAuth, authErrorResponse, clearSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await requireAuth();
        await dbConnect();
        const { password } = await req.json();

        if (!password) {
            return NextResponse.json({ error: "Please enter your password" }, { status: 400 });
        }

        const currentUser = await User.findById(session.userId);
        if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const isMatch = await bcrypt.compare(password, currentUser.password);
        if (!isMatch) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

        await User.findByIdAndDelete(session.userId);
        await clearSession();

        return NextResponse.json({ success: true, message: "Your account has been permanently deleted." });
    } catch (err) {
        return authErrorResponse(err);
    }
}
