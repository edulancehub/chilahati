import { NextRequest, NextResponse } from "next/server";
import { createContact } from "@/lib/firestore";

export async function POST(req: NextRequest) {
    try {
        const { name, email, message } = await req.json();

        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Basic email validation (server-side)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
        }

        // Guard against excessively long inputs
        if (name.trim().length > 100 || email.trim().length > 200 || message.trim().length > 5000) {
            return NextResponse.json({ error: "Input too long" }, { status: 400 });
        }

        await createContact({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
        });

        return NextResponse.json({ success: true, message: "Message sent successfully!" });
    } catch (err) {
        console.error("Contact form error:", err);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
