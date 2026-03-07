import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import {
    getArchiveItemBySlug,
    updateArchiveItemDoc,
    deleteArchiveItem,
    createArchiveItem,
    slugExists,
} from "@/lib/firestore";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const { id } = await params;
        const item = await getArchiveItemBySlug(id);
        if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
        return NextResponse.json({ item });
    } catch (err) {
        return authErrorResponse(err);
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const { id } = await params;
        const body = await req.json();
        const { title, slug, category, subType, thumbnail, bodyContent, bodyContentJSON, ...otherFields } = body;

        const existing = await getArchiveItemBySlug(id);
        if (!existing) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        let parsedBodyContent = [];
        if (Array.isArray(bodyContent)) {
            parsedBodyContent = bodyContent;
        } else if (bodyContentJSON) {
            try { parsedBodyContent = JSON.parse(bodyContentJSON); } catch { /**/ }
        }

        const updateData: Record<string, unknown> = {
            title, category,
            subType: subType || null,
            thumbnail: thumbnail || null,
            bodyContent: parsedBodyContent,
            ...otherFields,
        };

        if (otherFields.lat || otherFields.lng) {
            const lat = parseFloat(otherFields.lat as string);
            const lng = parseFloat(otherFields.lng as string);
            if (!isNaN(lat) && !isNaN(lng)) updateData.coordinates = { lat, lng };
        }
        if (otherFields.eventDate) updateData.dateOfIncident = otherFields.eventDate;

        const newSlug = slug && slug !== id ? slug : id;
        if (slug && slug !== id) {
            if (await slugExists(slug)) {
                return NextResponse.json({ error: "The slug already exists." }, { status: 409 });
            }
            await createArchiveItem(slug, { ...existing, ...updateData, slug });
            await deleteArchiveItem(id);
        } else {
            await updateArchiveItemDoc(id, { ...updateData, slug: id });
        }

        return NextResponse.json({ success: true, slug: newSlug });
    } catch (err) {
        if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
            return authErrorResponse(err);
        }
        console.error("Edit error:", err);
        return NextResponse.json({ error: "Error updating entry" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const { id } = await params;
        await deleteArchiveItem(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return authErrorResponse(err);
    }
}
