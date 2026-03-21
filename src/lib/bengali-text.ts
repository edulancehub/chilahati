/**
 * Process HTML so every whitespace-separated word sits inside
 * <span class="bw">…</span>.  `display:inline-block` on `.bw`
 * forces the browser to treat each word as an unbreakable unit,
 * preventing mid-word line-breaks in Bengali (Indic) script — a
 * well-known limitation of CSS word-break / overflow-wrap.
 */
export function wrapHtmlWords(html: string): string {
    if (!html) return html;

    let result = "";
    let inTag = false;
    let buf = "";

    for (let i = 0; i < html.length; i++) {
        const ch = html[i];

        if (ch === "<" && !inTag) {
            if (buf) {
                result += wrapRuns(buf);
                buf = "";
            }
            inTag = true;
            result += ch;
        } else if (ch === ">" && inTag) {
            inTag = false;
            result += ch;
        } else if (inTag) {
            result += ch;
        } else {
            buf += ch;
        }
    }

    if (buf) result += wrapRuns(buf);
    return result;
}

function wrapRuns(text: string): string {
    return text.replace(/(\S+)/g, '<span class="bw">$1</span>');
}
