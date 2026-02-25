import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ArchiveItem } from "@/models/ArchiveItem";
import { requireStaff, authErrorResponse } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const session = await requireStaff();
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = 10;
        const skip = (page - 1) * limit;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const searchCriteria: any = { author: session.userId };

        if (query) {
            const searchRegex = new RegExp(query, "i");
            searchCriteria.$or = [
                { title: searchRegex },
                { slug: searchRegex },
                { category: searchRegex },
                { subType: searchRegex },
            ];
        }

        const totalItems = await ArchiveItem.countDocuments(searchCriteria);
        const totalPages = Math.ceil(totalItems / limit);
        const items = await ArchiveItem.find(searchCriteria)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return NextResponse.json({ items, totalItems, totalPages, currentPage: page });
    } catch (err) {
        return authErrorResponse(err);
    }
}
