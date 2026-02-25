import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ArchiveItem } from "@/models/ArchiveItem";
import { normalizeBodyContentImages, normalizeImageUrl } from "@/lib/media";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        await dbConnect();
        const { slug } = await params;

        const itemRaw = await ArchiveItem.findOne({ slug }).populate("author", "username").lean();
        if (!itemRaw) {
            return NextResponse.json({ error: "Archive entry not found" }, { status: 404 });
        }

        const item = {
            ...itemRaw,
            thumbnail: normalizeImageUrl(itemRaw.thumbnail as string | undefined),
            bodyContent: normalizeBodyContentImages(itemRaw.bodyContent),
        };

        return NextResponse.json({ item });
    } catch (err) {
        console.error("Entry error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
