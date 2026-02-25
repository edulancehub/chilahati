import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { requireAuth, authErrorResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await requireAuth();
        await dbConnect();
        const { currentPassword, newPassword, confirmNewPassword } = await req.json();

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return NextResponse.json({ error: "Please fill in all password fields" }, { status: 400 });
        }
        if (newPassword !== confirmNewPassword) {
            return NextResponse.json({ error: "New passwords do not match" }, { status: 400 });
        }
        if (newPassword.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 });
        }

        const currentUser = await User.findById(session.userId);
        if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
        if (!isMatch) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

        const isSame = await bcrypt.compare(newPassword, currentUser.password);
        if (isSame) return NextResponse.json({ error: "New password must be different" }, { status: 400 });

        const salt = await bcrypt.genSalt(10);
        currentUser.password = await bcrypt.hash(newPassword, salt);
        await currentUser.save();

        return NextResponse.json({ success: true, message: "Password changed successfully!" });
    } catch (err) {
        return authErrorResponse(err);
    }
}
