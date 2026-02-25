import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ArchiveItem } from "@/models/ArchiveItem";

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

        const items = await ArchiveItem.find(query).select("title slug thumbnail category subType").lean();

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
