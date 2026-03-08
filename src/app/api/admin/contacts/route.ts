import { NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { listContacts } from "@/lib/firestore";

export async function GET() {
    try {
        await requireAdmin();
        const contacts = await listContacts();
        return NextResponse.json({ contacts });
    } catch (err) {
        return authErrorResponse(err);
    }
}
