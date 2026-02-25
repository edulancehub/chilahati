import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
    try {
        await dbConnect();
        const { token } = await params;
        const { password, confirmPassword } = await req.json();

        if (!password || !confirmPassword) {
            return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 });
        }
        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
        }

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json({ error: "Password reset token is invalid or has expired" }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return NextResponse.json({ success: true, message: "Password reset successful! You can now login." });
    } catch (err) {
        console.error("Reset password error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
