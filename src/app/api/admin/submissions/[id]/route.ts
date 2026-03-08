import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, authErrorResponse } from "@/lib/auth";
import { getSubmission, updateSubmissionDoc, createArchiveItem, deleteSubmission } from "@/lib/firestore";
import { generateUniqueArchiveSlug, textToParagraphHtml } from "@/lib/archive";
import { Timestamp } from "firebase-admin/firestore";

const VALID_CATEGORIES = new Set([
    "history", "culture", "institution", "notable people", "freedom fighters",
    "meritorious student", "hidden talent", "occupation", "Heartbreaking stories",
    "tourist spots", "transport", "Emergency services", "social works",
]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await requireAdmin();
        const { id } = await params;
        const { action, adminNotes } = await req.json();

        const submission = await getSubmission(id);
        if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
        if (submission.status !== "pending") {
            return NextResponse.json({ error: "Only pending submissions can be reviewed" }, { status: 400 });
        }

        if (action === "reject") {
            await updateSubmissionDoc(id, {
                status: "rejected",
                adminNotes: adminNotes?.trim() || null,
                reviewedBy: session.userId,
                reviewedAt: Timestamp.now(),
            });
            return NextResponse.json({ success: true, status: "rejected" });
        }

        if (action !== "approve") {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        if (!VALID_CATEGORIES.has(submission.category)) {
            return NextResponse.json({ error: `Invalid Category: ${submission.category}` }, { status: 400 });
        }

        const slug = await generateUniqueArchiveSlug(submission.title);
        const bodyContent: { type: string; content: string; order: number }[] = [
            { type: "paragraph", content: textToParagraphHtml(submission.message), order: 0 },
        ];
        if (submission.sourceLink) {
            bodyContent.push({
                type: "link",
                content: JSON.stringify({ title: "Source / contributor reference", url: submission.sourceLink }),
                order: 1,
            });
        }

        const itemData: Record<string, unknown> = {
            title: submission.title,
            slug,
            category: submission.category,
            authorUid: submission.submittedBy,
            bodyContent,
        };
        if (submission.subType) itemData.subType = submission.subType;

        await createArchiveItem(slug, itemData);
        await updateSubmissionDoc(id, {
            status: "approved",
            adminNotes: adminNotes?.trim() || null,
            reviewedBy: session.userId,
            reviewedAt: Timestamp.now(),
            publishedSlug: slug,
        });

        return NextResponse.json({ success: true, status: "approved", publishedSlug: slug });
    } catch (err) {
        if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
            return authErrorResponse(err);
        }
        console.error("Submission review error:", err);
        return NextResponse.json({ error: "Error reviewing submission" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireAdmin();
        const { id } = await params;
        await deleteSubmission(id);
        return NextResponse.json({ success: true });
    } catch (err) {
        return authErrorResponse(err);
    }
}
