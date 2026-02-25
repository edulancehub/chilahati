import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import { ArchiveItem, Institution, Transport, Emergency, SUB_TYPE_MAP } from "@/models/ArchiveItem";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
    try {
        await dbConnect();
        const { category } = await params;
        const lower = category.toLowerCase().replace(/-/g, " ");

        // Check if this category has sub-types
        const enumMap: Record<string, { model: typeof Institution; field: string }> = {
            institution: { model: Institution, field: "subType" },
            transport: { model: Transport, field: "transportType" },
            "emergency services": { model: Emergency, field: "serviceType" },
        };

        let subTypes: string[] = [];
        let foundField: string | null = null;

        if (enumMap[lower]) {
            const mapping = enumMap[lower];
            const info = SUB_TYPE_MAP[lower] || SUB_TYPE_MAP[category];
            if (info) {
                subTypes = info.values;
                foundField = info.field;
            } else {
                const schemaPath = mapping.model.schema.path(mapping.field);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (schemaPath && (schemaPath as any).enumValues?.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    subTypes = (schemaPath as any).enumValues;
                    foundField = mapping.field;
                }
            }
        }

        if (!foundField) {
            const candidateFields = ["subType", "transportType", "serviceType"];
            const queryCategory = category.replace(/-/g, " ");
            for (const field of candidateFields) {
                const vals = await ArchiveItem.distinct(field, { category: new RegExp("^" + queryCategory + "$", "i") });
                const cleaned = (vals || []).filter((v: unknown) => v !== undefined && v !== null && String(v).trim() !== "");
                if (cleaned.length > 0) {
                    foundField = field;
                    subTypes = cleaned;
                    break;
                }
            }
        }

        if (!foundField || subTypes.length === 0) {
            const queryCategory = category.replace(/-/g, " ");
            const items = await ArchiveItem.find({ category: new RegExp("^" + queryCategory + "$", "i") }).lean();
            return NextResponse.json({ type: "list", items, title: queryCategory, category: queryCategory });
        }

        return NextResponse.json({
            type: "sub-categories",
            category,
            subTypes,
            title: `Explore ${category.replace(/-/g, " ")}`,
        });
    } catch (err) {
        console.error("Archive category error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
