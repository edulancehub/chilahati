import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { MODEL_MAP } from "@/models/ArchiveItem";
import { requireStaff, authErrorResponse } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const session = await requireStaff();
        await dbConnect();
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
        const itemData: any = {
            title, slug, category, subType, thumbnail,
            author: session.userId,
            bodyContent: parsedBodyContent,
            ...otherFields,
        };

        if (category === "transport") itemData.transportType = subType;
        if (category === "Emergency services") itemData.serviceType = subType;

        if (otherFields.lat || otherFields.lng) {
            const lat = parseFloat(otherFields.lat);
            const lng = parseFloat(otherFields.lng);
            if (!isNaN(lat) && !isNaN(lng)) itemData.coordinates = { lat, lng };
        }
        if (otherFields.eventDate) itemData.dateOfIncident = otherFields.eventDate;

        const newItem = new SelectedModel(itemData);
        await newItem.save();

        return NextResponse.json({ success: true, slug: newItem.slug });
    } catch (err) {
        if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
            return authErrorResponse(err);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = err as any;
        if (e?.code === 11000) {
            return NextResponse.json({ error: "The slug already exists. Please use a unique slug." }, { status: 409 });
        }
        console.error("Add content error:", err);
        return NextResponse.json({ error: "Error creating entry: " + (err instanceof Error ? err.message : "Unknown") }, { status: 500 });
    }
}
