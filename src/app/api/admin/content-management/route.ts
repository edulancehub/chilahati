import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { paginateArchiveAdmin } from "@/lib/firestore";

export async function GET(req: NextRequest) {
    try {
        await requireAdmin();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 10;
        const { items, total, totalPages } = await paginateArchiveAdmin(query, page, limit);
        return NextResponse.json({ items, totalItems: total, totalPages, currentPage: page });
    } catch (err) {
        return authErrorResponse(err);
    }
}
