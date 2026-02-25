import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { sendMail } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const session = await requireAuth();
        await dbConnect();
        const { message } = await req.json();

        if (!message || message.trim().length === 0) {
            return NextResponse.json({ error: "Please enter a message" }, { status: 400 });
        }

        await sendMail(
            process.env.CONTRIBUTE_RECEIVER_EMAIL || process.env.EMAIL_USER || "",
            `Message from ${session.username} (${session.email})`,
            `<p><strong>Contributor:</strong> ${session.username} (${session.email})</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br>")}</p><hr><p><small>Sent via the Chilahati Archive contribution form.</small></p>`
        );

        return NextResponse.json({ success: true, message: "Thank you! Your message has been sent." });
    } catch (err) {
        return authErrorResponse(err);
    }
}
