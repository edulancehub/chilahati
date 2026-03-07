import { slugExists } from "@/lib/firestore";

export function slugify(value: string): string {
    return (
        value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "entry"
    );
}

export async function generateUniqueArchiveSlug(baseValue: string): Promise<string> {
    const baseSlug = slugify(baseValue);
    if (!(await slugExists(baseSlug))) return baseSlug;
    for (let i = 2; i <= 100; i++) {
        const candidate = `${baseSlug}-${i}`;
        if (!(await slugExists(candidate))) return candidate;
    }
    return `${baseSlug}-${Date.now()}`;
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function textToParagraphHtml(value: string): string {
    return value
        .trim()
        .split(/\n\s*\n/)
        .filter(Boolean)
        .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
        .join("");
}
