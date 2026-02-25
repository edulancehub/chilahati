import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { sendMail, getBaseUrl } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { username, email, password } = await req.json();

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });

        if (existingUser) {
            if (!existingUser.isVerified) {
                const token = crypto.randomBytes(32).toString("hex");
                existingUser.verificationToken = token;
                existingUser.createdAt = new Date();
                await existingUser.save();

                const verificationLink = `${getBaseUrl()}/verify/${token}`;
                await sendMail(
                    email,
                    "Confirm your Chilahati Archive account",
                    `<p>An unverified account already exists. Please <strong><a href="${verificationLink}">click here</a></strong> to verify. Expires in 1 hour.</p>`
                );

                return NextResponse.json({
                    error: "An unverified account with this email/username already exists. A new verification link has been sent.",
                }, { status: 409 });
            }
            return NextResponse.json({ error: "Email or Username is already registered. Please Login." }, { status: 409 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const token = crypto.randomBytes(32).toString("hex");

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            isVerified: false,
            verificationToken: token,
        });

        await newUser.save();

        const verificationLink = `${getBaseUrl()}/verify/${token}`;

        try {
            await sendMail(
                email,
                "Confirm your Chilahati Archive account",
                `<p>Hi,</p><p>Welcome to Chilahati Archive! Please verify your account by <strong><a href="${verificationLink}">clicking here</a></strong>.</p><p><strong>Note:</strong> This link will expire in 1 hour.</p><p>Best regards,<br>The Chilahati Archive Team</p>`
            );

            return NextResponse.json({
                success: true,
                message: `Registration successful! We have sent a verification email to ${email}. Please check your inbox.`,
            });
        } catch {
            await User.findByIdAndDelete(newUser._id);
            return NextResponse.json({ error: "Failed to send verification email. Please check your email and try again." }, { status: 500 });
        }
    } catch (err) {
        console.error("Register error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
