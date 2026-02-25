export function normalizeImageUrl(url?: string | null): string {
    if (!url) return "";

    const value = String(url).trim();
    if (!value) return "";

    if (value.includes("lh3.googleusercontent.com/d/")) return value;

    const driveFileMatch = value.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (driveFileMatch) {
        return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
    }

    const idParamMatch = value.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (idParamMatch) {
        return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
    }

    const pathIdMatch = value.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (pathIdMatch) {
        return `https://lh3.googleusercontent.com/d/${pathIdMatch[1]}`;
    }

    return value;
}

type Block = { type?: string; content?: unknown };

export function normalizeBodyContentImages<T extends Block>(blocks: T[] = []): T[] {
    return blocks.map((block) => {
        if (block?.type !== "image") return block;

        const content = block.content ? String(block.content) : "";
        if (!content) return block;

        try {
            const parsed = JSON.parse(content) as { url?: string; caption?: string };
            if (parsed?.url) {
                return {
                    ...block,
                    content: JSON.stringify({
                        ...parsed,
                        url: normalizeImageUrl(parsed.url),
                    }),
                };
            }
        } catch {
            return {
                ...block,
                content: normalizeImageUrl(content),
            };
        }

        return block;
    });
}