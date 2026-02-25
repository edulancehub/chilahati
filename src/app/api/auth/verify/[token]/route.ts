import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    try {
        await dbConnect();
        const { token } = await params;

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return NextResponse.json({ error: "Invalid or expired verification link." }, { status: 400 });
        }

        const oneHour = 60 * 60 * 1000;
        if (Date.now() - new Date(user.createdAt).getTime() > oneHour) {
            return NextResponse.json({ error: "Verification link expired. Please register again." }, { status: 400 });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        return NextResponse.json({ success: true, message: "Email verified! You can now login." });
    } catch (err) {
        console.error("Verify error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
