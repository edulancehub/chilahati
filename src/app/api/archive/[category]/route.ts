import { NextRequest, NextResponse } from "next/server";
import { listArchiveItemsByCategory } from "@/lib/firestore";
import { normalizeImageUrl } from "@/lib/media";

const SUB_TYPE_MAP: Record<string, string[]> = {
    institution: ["educational", "governmental", "Banks", "Religious", "other"],
    transport: ["bus", "train", "auto stand", "launch-ghat"],
    "emergency services": ["hospitals", "police", "fire"],
};

const CATEGORY_ALIASES: Record<string, string> = {
    "notable-people": "notable people",
    "freedom-fighters": "freedom fighters",
    "meritorious-student": "meritorious student",
    "hidden-talent": "hidden talent",
    "heartbreaking-stories": "Heartbreaking stories",
    "tourist-spots": "tourist spots",
    "emergency-services": "Emergency services",
    "social-works": "social works",
};

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ category: string }> }
) {
    try {
        const { category } = await params;
        const resolvedCategory = CATEGORY_ALIASES[category] ?? category.replace(/-/g, " ");
        const lower = resolvedCategory.toLowerCase();

        const subTypes = SUB_TYPE_MAP[lower];
        if (subTypes) {
            return NextResponse.json({
                type: "sub-categories",
                category: resolvedCategory,
                subTypes,
                title: `Explore ${resolvedCategory}`,
            });
        }

        const itemsRaw = await listArchiveItemsByCategory(resolvedCategory);
        const items = itemsRaw.map((item) => ({
            ...item,
            thumbnail: normalizeImageUrl(item.thumbnail as string | undefined),
        }));

        return NextResponse.json({
            type: "list",
            items,
            title: resolvedCategory,
            category: resolvedCategory,
        });
    } catch (err) {
        console.error("Archive category error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
