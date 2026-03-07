import { NextRequest, NextResponse } from "next/server";
import { getArchiveItemBySlug } from "@/lib/firestore";
import { normalizeBodyContentImages, normalizeImageUrl } from "@/lib/media";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const item = await getArchiveItemBySlug(slug);
        if (!item) return NextResponse.json({ error: "Archive entry not found" }, { status: 404 });

        const normalized = {
            ...item,
            thumbnail: normalizeImageUrl(item.thumbnail as string | undefined),
            bodyContent: normalizeBodyContentImages(
                item.bodyContent as { type?: string; content?: unknown }[]
            ),
        };

        return NextResponse.json({ item: normalized });
    } catch (err) {
        console.error("Entry error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
