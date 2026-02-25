import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ArchiveItem } from "@/models/ArchiveItem";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 10;
        const skip = (page - 1) * limit;

        if (!query) {
            return NextResponse.json({ results: [], query: "", currentPage: 1, totalPages: 0, totalResults: 0 });
        }

        const searchRegex = new RegExp(query, "i");
        const searchCriteria = {
            $or: [
                { title: searchRegex },
                { slug: searchRegex },
                { tags: searchRegex },
                { category: searchRegex },
                { bodyContent: { $elemMatch: { type: { $in: ["paragraph", "heading", "list", "quote"] }, content: searchRegex } } },
                { subType: searchRegex },
                { profession: searchRegex },
                { education: searchRegex },
                { achievements: searchRegex },
                { address: searchRegex },
                { period: searchRegex },
                { significance: searchRegex },
                { involvedParties: searchRegex },
                { foundedBy: searchRegex },
                { missionStatement: searchRegex },
                { traditionalName: searchRegex },
                { toolsUsed: searchRegex },
                { headOfInstitution: searchRegex },
                { transportType: searchRegex },
                { destinations: searchRegex },
                { serviceType: searchRegex },
                { entryFee: searchRegex },
                { bestTimeToVisit: searchRegex },
                { sectorNo: searchRegex },
                { currentStatus: searchRegex },
                { occupationStatus: searchRegex },
            ],
        };

        const totalResults = await ArchiveItem.countDocuments(searchCriteria);
        const totalPages = Math.ceil(totalResults / limit);

        const results = await ArchiveItem.find(searchCriteria).lean();

        // Sort by relevance
        const q = query.toLowerCase();
        results.sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            const aStartsWith = aTitle.startsWith(q);
            const bStartsWith = bTitle.startsWith(q);
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            const aContains = aTitle.includes(q);
            const bContains = bTitle.includes(q);
            if (aContains && !bContains) return -1;
            if (!aContains && bContains) return 1;
            return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        });

        const paginatedResults = results.slice(skip, skip + limit);

        return NextResponse.json({
            results: paginatedResults,
            query,
            currentPage: page,
            totalPages,
            totalResults,
        });
    } catch (err) {
        console.error("Search error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
