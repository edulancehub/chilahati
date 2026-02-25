import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sendMail, getBaseUrl } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            // Security: don't reveal if email exists
            return NextResponse.json({ success: true, message: "If that email exists, a password reset link has been sent." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = new Date(Date.now() + 3600000);
        await user.save();

        const resetLink = `${getBaseUrl()}/reset-password/${resetToken}`;
        await sendMail(
            email,
            "Reset your Chilahati Archive password",
            `<p>Hi,</p><p>You requested a password reset. Please <strong><a href="${resetLink}">click here to reset your password</a></strong>.</p><p>This link is valid for 1 hour.</p><p>Best regards,<br>The Chilahati Archive Team</p>`
        );

        return NextResponse.json({ success: true, message: "Password reset email sent! Please check your inbox." });
    } catch (err) {
        console.error("Forgot password error:", err);
        return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    }
}
