import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { deleteContact } from "@/lib/firestore";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const { id } = await params;
        await deleteContact(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return authErrorResponse(err);
    }
}
