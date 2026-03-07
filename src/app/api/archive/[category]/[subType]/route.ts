import { NextRequest, NextResponse } from "next/server";
import { listArchiveItemsByCategoryAndSubType } from "@/lib/firestore";
import { normalizeImageUrl } from "@/lib/media";

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
    { params }: { params: Promise<{ category: string; subType: string }> }
) {
    try {
        const { category, subType } = await params;
        const resolvedCategory = CATEGORY_ALIASES[category] ?? category.replace(/-/g, " ");
        const decodedSubType = decodeURIComponent(subType);

        const itemsRaw = await listArchiveItemsByCategoryAndSubType(resolvedCategory, decodedSubType);
        const items = itemsRaw.map((item) => ({
            ...item,
            thumbnail: normalizeImageUrl(item.thumbnail as string | undefined),
        }));

        return NextResponse.json({
            items,
            title: `${decodedSubType} - ${resolvedCategory}`,
            category: resolvedCategory,
            subType: decodedSubType,
        });
    } catch (err) {
        console.error("Archive sub-type error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
