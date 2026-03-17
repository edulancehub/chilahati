import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArchiveItemBySlug, listAllArchiveSlugs } from "@/lib/firestore";
import { normalizeBodyContentImages, normalizeImageUrl } from "@/lib/media";
import { getSession } from "@/lib/auth";

export const revalidate = 60; // ISR: regenerate every 60 seconds

export async function generateStaticParams() {
    try {
        const slugs = await listAllArchiveSlugs();
        return slugs.map((slug) => ({ slug }));
    } catch {
        return [];
    }
}

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    const item = await getArchiveItemBySlug(slug);
    if (!item) return { title: "Not Found | Chilahati Archive" };
    return {
        title: `${item.title} | Chilahati Archive`,
        description: `Learn about ${item.title} from the Chilahati local archive — ${item.category}`,
        openGraph: {
            title: item.title,
            description: `Explore ${item.category} from Chilahati`,
            images: item.thumbnail ? [normalizeImageUrl(item.thumbnail)] : [],
        },
    };
}

interface BodyBlock {
    type: string;
    content: string;
    order: number;
}

function formatDate(dateStr: string | undefined) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getEmbedUrl(url: string) {
    if (!url) return "";
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const gdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (gdMatch) return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
    return url;
}

function normalizeExternalUrl(url: string) {
    const value = String(url || "").trim();
    if (!value) return "#";
    if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
    return `https://${value}`;
}

function renderBlock(block: BodyBlock, itemTitle: string) {
    if (block.type === "heading") {
        return <h2 key={block.order} className="block-heading">{block.content}</h2>;
    }
    if (block.type === "paragraph") {
        return <div key={block.order} className="block-paragraph" dangerouslySetInnerHTML={{ __html: block.content }} />;
    }
    if (block.type === "image") {
        let imgUrl = "";
        let imgCaption = "";
        if (typeof block.content === "string") {
            try {
                const parsed = JSON.parse(block.content);
                imgUrl = parsed.url || block.content;
                imgCaption = parsed.caption || "";
            } catch {
                imgUrl = block.content;
            }
        }
        return (
            <figure key={block.order} className="block-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={normalizeImageUrl(imgUrl)} alt={imgCaption || itemTitle} referrerPolicy="no-referrer" style={{ maxWidth: "100%", height: "auto" }} />
                {imgCaption && <figcaption>{imgCaption}</figcaption>}
            </figure>
        );
    }
    if (block.type === "video") {
        const embedUrl = getEmbedUrl(block.content);
        return (
            <div key={block.order} className="block-video">
                <iframe src={embedUrl} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
        );
    }
    if (block.type === "link") {
        let linkData = { title: "Open Link", url: "#" };
        try { linkData = JSON.parse(block.content); } catch { linkData.url = block.content; }
        return (
            <div key={block.order} className="block-link">
                <a href={normalizeExternalUrl(linkData.url)} target="_blank" rel="noopener noreferrer" className="external-link">
                    <i className="fas fa-link"></i> {linkData.title}
                </a>
            </div>
        );
    }
    if (block.type === "pdf") {
        return (
            <div key={block.order} className="block-pdf">
                <iframe src={block.content} width="100%" height="600px"></iframe>
                <a href={block.content} target="_blank" rel="noopener noreferrer" className="download-link">
                    <i className="fas fa-external-link-alt"></i> Open Document in New Tab
                </a>
            </div>
        );
    }
    return null;
}

export default async function EntryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const [item, session] = await Promise.all([
        getArchiveItemBySlug(slug),
        getSession(),
    ]);

    if (!item) notFound();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = item as any;

    const normalizedItem = {
        ...item,
        thumbnail: normalizeImageUrl(item.thumbnail as string | undefined),
        bodyContent: normalizeBodyContentImages(
            item.bodyContent as { type?: string; content?: unknown }[]
        ),
    };

    const categorySlug = item.category.replace(/\s+/g, "-");
    const subTypeVal = item.subType as string | undefined;
    const isAdmin = session?.role === "admin";

    const sortedBlocks = [...(normalizedItem.bodyContent as BodyBlock[])].sort((a, b) => a.order - b.order);

    let mapUrl = "";
    if (item.locationLink) {
        const trimmed = String(item.locationLink).trim();
        mapUrl = trimmed.startsWith("http")
            ? trimmed
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
    }

    return (
        <div className="main-content detail-page">
            <div className="detail-container">
                {/* LEFT: Main Content */}
                <article className="content-area">
                    <header className="entry-header">
                        <nav className="breadcrumb" style={{ textTransform: "capitalize" }}>
                            <Link href={`/archive/${encodeURIComponent(categorySlug)}`}>{item.category}</Link>
                            {subTypeVal && (
                                <>
                                    {" / "}
                                    <Link href={`/archive/${encodeURIComponent(categorySlug)}/${encodeURIComponent(subTypeVal)}`}>{subTypeVal}</Link>
                                </>
                            )}
                        </nav>
                        <h1>{item.title}</h1>
                        <hr />
                    </header>

                    <div className="entry-body">
                        {sortedBlocks.map((block) => renderBlock(block, item.title))}
                    </div>

                    <footer className="entry-footer" style={{ marginTop: "2rem", opacity: 0.7 }}>
                        <p>Last Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "—"}</p>
                        {isAdmin && (
                            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                                <Link
                                    href={`/admin/edit/${encodeURIComponent(item.id)}`}
                                    style={{
                                        padding: "0.6rem 1.2rem",
                                        background: "#4a90e2",
                                        borderRadius: "6px",
                                        textDecoration: "none",
                                        color: "white",
                                        fontWeight: 600,
                                    }}
                                >
                                    <i className="fas fa-edit"></i> Edit
                                </Link>
                            </div>
                        )}
                    </footer>
                </article>

                {/* RIGHT: Infobox */}
                <aside className="infobox">
                    <div className="infobox-title">{item.title}</div>

                    {normalizedItem.thumbnail && (
                        <div className="infobox-image">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={normalizedItem.thumbnail} alt="Thumbnail" referrerPolicy="no-referrer" />
                        </div>
                    )}

                    <table className="infobox-table">
                        <tbody>
                            <tr>
                                <th>Category</th>
                                <td style={{ textTransform: "capitalize" }}>{item.category}</td>
                            </tr>
                            {subTypeVal && (
                                <tr>
                                    <th>Sub-type</th>
                                    <td style={{ textTransform: "capitalize" }}>{subTypeVal}</td>
                                </tr>
                            )}
                            {d.dateOfBirth && (
                                <tr><th>Birth</th><td>{formatDate(d.dateOfBirth)}</td></tr>
                            )}
                            {d.dateOfDeath && (
                                <tr><th>Death</th><td>{formatDate(d.dateOfDeath)}</td></tr>
                            )}
                            {d.profession && (
                                <tr><th>Profession</th><td>{d.profession}</td></tr>
                            )}
                            {d.education && (
                                <tr><th>Education</th><td>{d.education}</td></tr>
                            )}
                            {d.passingYear && (
                                <tr><th>Passing Year</th><td>{d.passingYear}</td></tr>
                            )}
                            {d.currentStatus && (
                                <tr><th>Status</th><td>{d.currentStatus}</td></tr>
                            )}
                            {d.sectorNo && (
                                <tr><th>Sector No</th><td>{d.sectorNo}</td></tr>
                            )}
                            {Array.isArray(d.achievements) && d.achievements.length > 0 && (
                                <tr>
                                    <th>Achievements</th>
                                    <td>
                                        <ul style={{ margin: 0, paddingLeft: "15px", fontSize: "0.9em" }}>
                                            {(d.achievements as string[]).map((a: string, i: number) => <li key={i}>{a}</li>)}
                                        </ul>
                                    </td>
                                </tr>
                            )}
                            {d.period && (
                                <tr><th>Period</th><td>{d.period}</td></tr>
                            )}
                            {d.significance && (
                                <tr><th>Significance</th><td>{d.significance}</td></tr>
                            )}
                            {d.dateOfIncident && (
                                <tr><th>Date of Incident</th><td>{formatDate(d.dateOfIncident)}</td></tr>
                            )}
                            {Array.isArray(d.involvedParties) && d.involvedParties.length > 0 && (
                                <tr><th>Involved Parties</th><td>{(d.involvedParties as string[]).join(", ")}</td></tr>
                            )}
                            {d.traditionalName && (
                                <tr><th>Traditional Name</th><td>{d.traditionalName}</td></tr>
                            )}
                            {Array.isArray(d.toolsUsed) && d.toolsUsed.length > 0 && (
                                <tr><th>Tools Used</th><td>{(d.toolsUsed as string[]).join(", ")}</td></tr>
                            )}
                            {d.occupationStatus && (
                                <tr><th>Current Status</th><td>{d.occupationStatus}</td></tr>
                            )}
                            {d.foundedBy && (
                                <tr><th>Founded By</th><td>{d.foundedBy}</td></tr>
                            )}
                            {d.establishedDate && (
                                <tr><th>Established</th><td>{formatDate(d.establishedDate)}</td></tr>
                            )}
                            {d.headOfInstitution && (
                                <tr><th>Head / Manager</th><td>{d.headOfInstitution}</td></tr>
                            )}
                            {d.missionStatement && (
                                <tr>
                                    <th>Mission</th>
                                    <td><div style={{ fontSize: "0.85em", fontStyle: "italic" }}>&ldquo;{d.missionStatement}&rdquo;</div></td>
                                </tr>
                            )}
                            {d.address && (
                                <tr><th>Address</th><td>{d.address}</td></tr>
                            )}
                            {d.contactPhone && (
                                <tr><th>Contact</th><td>{d.contactPhone}</td></tr>
                            )}
                            {Array.isArray(d.destinations) && d.destinations.length > 0 && (
                                <tr><th>Destinations</th><td>{(d.destinations as string[]).join(", ")}</td></tr>
                            )}
                            {d.entryFee && (
                                <tr><th>Entry Fee</th><td>{d.entryFee}</td></tr>
                            )}
                            {d.bestTimeToVisit && (
                                <tr><th>Best Time to Visit</th><td>{d.bestTimeToVisit}</td></tr>
                            )}
                            {item.category === "Emergency services" && typeof d.is24Hours !== "undefined" && (
                                <tr><th>24/7 Service</th><td>{d.is24Hours ? "Yes" : "No"}</td></tr>
                            )}
                        </tbody>
                    </table>

                    {mapUrl && (
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="map-btn">
                            <i className="fas fa-map-marker-alt"></i> View on Google Maps
                        </a>
                    )}
                </aside>
            </div>
        </div>
    );
}
