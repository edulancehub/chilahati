import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ArchiveItem, MODEL_MAP } from "@/models/ArchiveItem";
import { requireStaff, authErrorResponse } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireStaff();
        await dbConnect();
        const { id } = await params;

        const item = await ArchiveItem.findById(id).populate("author", "username");
        if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        const itemObj = item.toObject();
        itemObj.subType = item.subType || item.transportType || item.serviceType || "";

        return NextResponse.json({ item: itemObj });
    } catch (err) {
        return authErrorResponse(err);
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireStaff();
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const { title, slug, category, subType, thumbnail, bodyContentJSON, ...otherFields } = body;

        const SelectedModel = MODEL_MAP[category];
        if (!SelectedModel) {
            return NextResponse.json({ error: `Invalid Category: ${category}` }, { status: 400 });
        }

        let parsedBodyContent = [];
        if (bodyContentJSON) {
            try {
                parsedBodyContent = JSON.parse(bodyContentJSON);
            } catch { /* ignore */ }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {
            title, slug, category, subType, thumbnail,
            bodyContent: parsedBodyContent,
            ...otherFields,
        };

        if (category === "transport") updateData.transportType = subType;
        if (category === "Emergency services") updateData.serviceType = subType;

        if (otherFields.lat || otherFields.lng) {
            const lat = parseFloat(otherFields.lat);
            const lng = parseFloat(otherFields.lng);
            if (!isNaN(lat) && !isNaN(lng)) updateData.coordinates = { lat, lng };
        }
        if (otherFields.eventDate) updateData.dateOfIncident = otherFields.eventDate;

        // Handle discriminator key change
        const currentItem = await ArchiveItem.findById(id);
        if (currentItem && currentItem.category !== category) {
            await ArchiveItem.collection.updateOne(
                { _id: currentItem._id },
                { $set: { category } }
            );
        }

        const updatedItem = await ArchiveItem.findByIdAndUpdate(id, updateData, { new: true, strict: false });
        if (!updatedItem) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        return NextResponse.json({ success: true, slug: updatedItem.slug });
    } catch (err) {
        if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
            return authErrorResponse(err);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = err as any;
        if (e?.code === 11000) {
            return NextResponse.json({ error: "The slug already exists." }, { status: 409 });
        }
        console.error("Edit error:", err);
        return NextResponse.json({ error: "Error updating entry" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireStaff();
        await dbConnect();
        const { id } = await params;

        await ArchiveItem.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return authErrorResponse(err);
    }
}
