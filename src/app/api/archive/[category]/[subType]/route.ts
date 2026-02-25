import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ArchiveItem } from "@/models/ArchiveItem";
import { normalizeImageUrl } from "@/lib/media";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ category: string; subType: string }> }
) {
    try {
        await dbConnect();
        const { category, subType } = await params;
        const queryCategory = category.replace(/-/g, " ");

        const subtypeFields = ["subType", "transportType", "serviceType"];
        const orClauses = subtypeFields.map((f) => ({ [f]: subType }));

        const query = {
            category: new RegExp("^" + queryCategory + "$", "i"),
            $or: orClauses,
        };

        const itemsRaw = await ArchiveItem.find(query).select("title slug thumbnail category subType").lean();
        const items = itemsRaw.map((item) => ({
            ...item,
            thumbnail: normalizeImageUrl(item.thumbnail as string | undefined),
        }));

        return NextResponse.json({
            items,
            title: `${subType} ${queryCategory}`,
            category: queryCategory,
            subType,
        });
    } catch (err) {
        console.error("Archive sub-type error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
