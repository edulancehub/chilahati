import { NextRequest, NextResponse } from "next/server";
import { searchArchiveItems } from "@/lib/firestore";
import { normalizeImageUrl } from "@/lib/media";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 10;

        if (!query) {
            return NextResponse.json({ results: [], query: "", currentPage: 1, totalPages: 0, totalResults: 0 });
        }

        const allResults = await searchArchiveItems(query);

        const q = query.toLowerCase();
        allResults.sort((a, b) => {
            const aTitle = (a.title || "").toLowerCase();
            const bTitle = (b.title || "").toLowerCase();
            const aScore = aTitle === q ? 2 : aTitle.startsWith(q) ? 1 : 0;
            const bScore = bTitle === q ? 2 : bTitle.startsWith(q) ? 1 : 0;
            return bScore - aScore;
        });

        const totalResults = allResults.length;
        const totalPages = Math.ceil(totalResults / limit);
        const start = (page - 1) * limit;
        const results = allResults.slice(start, start + limit).map((item) => ({
            ...item,
            thumbnail: normalizeImageUrl(item.thumbnail as string | undefined),
        }));

        return NextResponse.json({ results, query, currentPage: page, totalPages, totalResults });
    } catch (err) {
        console.error("Search error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
