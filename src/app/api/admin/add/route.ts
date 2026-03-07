import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { createArchiveItem, slugExists } from "@/lib/firestore";

const VALID_CATEGORIES = new Set([
    "history", "culture", "institution", "notable people", "freedom fighters",
    "meritorious student", "hidden talent", "occupation", "Heartbreaking stories",
    "tourist spots", "transport", "Emergency services", "social works",
]);

export async function POST(req: NextRequest) {
    try {
        const session = await requireAdmin();
        const body = await req.json();
        const { title, slug, category, subType, thumbnail, bodyContent, bodyContentJSON, ...otherFields } = body;

        if (!VALID_CATEGORIES.has(category)) {
            return NextResponse.json({ error: `Invalid Category: ${category}` }, { status: 400 });
        }
        if (!slug || !title || !category) {
            return NextResponse.json({ error: "Title, slug, and category are required" }, { status: 400 });
        }
        if (await slugExists(slug)) {
            return NextResponse.json({ error: "The slug already exists. Please use a unique slug." }, { status: 409 });
        }

        let parsedBodyContent = [];
        if (Array.isArray(bodyContent)) {
            parsedBodyContent = bodyContent;
        } else if (bodyContentJSON) {
            try { parsedBodyContent = JSON.parse(bodyContentJSON); } catch { /**/ }
        }

        const itemData: Record<string, unknown> = {
            title, slug, category,
            subType: subType || null,
            thumbnail: thumbnail || null,
            authorUid: session.userId,
            bodyContent: parsedBodyContent,
            ...otherFields,
        };

        if (otherFields.lat || otherFields.lng) {
            const lat = parseFloat(otherFields.lat as string);
            const lng = parseFloat(otherFields.lng as string);
            if (!isNaN(lat) && !isNaN(lng)) itemData.coordinates = { lat, lng };
        }
        if (otherFields.eventDate) itemData.dateOfIncident = otherFields.eventDate;

        await createArchiveItem(slug, itemData);
        return NextResponse.json({ success: true, slug });
    } catch (err) {
        if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
            return authErrorResponse(err);
        }
        console.error("Add content error:", err);
        return NextResponse.json({ error: "Error creating entry: " + (err instanceof Error ? err.message : "Unknown") }, { status: 500 });
    }
}
