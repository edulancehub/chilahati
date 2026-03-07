import { NextRequest, NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { createSubmission } from "@/lib/firestore";

export async function POST(req: NextRequest) {
    try {
        const session = await requireAuth();
        const { title, category, subType, message, sourceLink } = await req.json();

        if (!title || !category || !message?.trim()) {
            return NextResponse.json(
                { error: "Please provide a title, category, and summary" },
                { status: 400 }
            );
        }

        await createSubmission({
            title: title.trim(),
            category,
            subType: subType || null,
            message: message.trim(),
            sourceLink: sourceLink?.trim() || null,
            submittedBy: session.userId,
            submitterName: session.username,
            submitterEmail: session.email,
        });

        return NextResponse.json({
            success: true,
            message: "Your contribution is now pending admin review.",
        });
    } catch (err) {
        return authErrorResponse(err);
    }
}
