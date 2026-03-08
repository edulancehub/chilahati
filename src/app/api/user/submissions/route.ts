import { NextResponse } from "next/server";
import { requireAuth, authErrorResponse } from "@/lib/auth";
import { listSubmissionsByUser } from "@/lib/firestore";

export async function GET() {
    try {
        const session = await requireAuth();
        const submissions = await listSubmissionsByUser(session.userId);
        return NextResponse.json({ submissions });
    } catch (err) {
        return authErrorResponse(err);
    }
}
