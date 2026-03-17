import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { createArchiveItem, slugExists } from "@/lib/firestore";

const VALID_CATEGORIES = new Set([
    "history", "culture", "institution", "notable people", "freedom fighters",
    "meritorious student", "hidden talent", "occupation", "Heartbreaking stories",
    "tourist spots", "transport", "Emergency services", "social works", "more",
]);

const ALLOWED_BLOCK_TYPES = new Set(["heading", "paragraph", "image", "video", "link", "pdf"]);

function normalizeSlug(rawSlug: unknown, fallbackTitle: unknown): string {
    const candidate = String(rawSlug || fallbackTitle || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[/?#]+/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return candidate;
}

function cleanRecord(record: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
        if (typeof value === "undefined") continue;
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed) continue;
            cleaned[key] = trimmed;
            continue;
        }
        cleaned[key] = value;
    }
    return cleaned;
}

export async function POST(req: NextRequest) {
    try {
        const session = await requireAdmin();
        const body = await req.json();
        const { title, slug, category, subType, thumbnail, bodyContent, bodyContentJSON, ...otherFields } = body;
        const normalizedCategory = String(category || "").trim();
        const normalizedTitle = String(title || "").trim();
        const normalizedSlug = normalizeSlug(slug, title);

        if (!VALID_CATEGORIES.has(normalizedCategory)) {
            return NextResponse.json({ error: `Invalid Category: ${normalizedCategory}` }, { status: 400 });
        }
        if (!normalizedSlug || !normalizedTitle || !normalizedCategory) {
            return NextResponse.json({ error: "Title, slug, and category are required" }, { status: 400 });
        }
        if (await slugExists(normalizedSlug)) {
            return NextResponse.json({ error: "The slug already exists. Please use a unique slug." }, { status: 409 });
        }

        let parsedBodyContent: Array<{ type: string; content: string; order: number }> = [];
        if (Array.isArray(bodyContent)) {
            parsedBodyContent = bodyContent
                .filter((block) => block && ALLOWED_BLOCK_TYPES.has(String(block.type)))
                .map((block, index) => {
                    const content = typeof block.content === "string"
                        ? block.content
                        : JSON.stringify(block.content ?? "");
                    return {
                        type: String(block.type),
                        content,
                        order: Number.isFinite(block.order) ? Number(block.order) : index,
                    };
                });
        } else if (bodyContentJSON) {
            try {
                const parsed = JSON.parse(bodyContentJSON);
                if (Array.isArray(parsed)) {
                    parsedBodyContent = parsed
                        .filter((block) => block && ALLOWED_BLOCK_TYPES.has(String(block.type)))
                        .map((block, index) => ({
                            type: String(block.type),
                            content: typeof block.content === "string"
                                ? block.content
                                : JSON.stringify(block.content ?? ""),
                            order: Number.isFinite(block.order) ? Number(block.order) : index,
                        }));
                }
            } catch {
                parsedBodyContent = [];
            }
        }

        const safeFields = cleanRecord(otherFields as Record<string, unknown>);

        const itemData: Record<string, unknown> = {
            title: normalizedTitle,
            slug: normalizedSlug,
            category: normalizedCategory,
            subType: subType ? String(subType).trim() : null,
            thumbnail: thumbnail ? String(thumbnail).trim() : null,
            authorUid: session.userId,
            bodyContent: parsedBodyContent,
            ...safeFields,
        };

        if (safeFields.lat || safeFields.lng) {
            const lat = parseFloat(String(safeFields.lat));
            const lng = parseFloat(String(safeFields.lng));
            if (!isNaN(lat) && !isNaN(lng)) itemData.coordinates = { lat, lng };
        }
        if (safeFields.eventDate) itemData.dateOfIncident = safeFields.eventDate;

        await createArchiveItem(normalizedSlug, itemData);
        return NextResponse.json({ success: true, slug: normalizedSlug });
    } catch (err) {
        if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
            return authErrorResponse(err);
        }
        console.error("Add content error:", err);
        return NextResponse.json({ error: "Error creating entry: " + (err instanceof Error ? err.message : "Unknown") }, { status: 500 });
    }
}
