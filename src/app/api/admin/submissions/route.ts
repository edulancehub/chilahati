import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { listSubmissions } from "@/lib/firestore";

export async function GET(req: NextRequest) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status") || undefined;
        const submissions = await listSubmissions(status);
        return NextResponse.json({ submissions });
    } catch (err) {
        return authErrorResponse(err);
    }
}