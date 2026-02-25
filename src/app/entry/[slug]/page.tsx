"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { normalizeImageUrl } from "@/lib/media";

interface BodyBlock {
    type: string;
    content: string;
    order: number;
}

interface EntryItem {
    _id: string;
    title: string;
    slug: string;
    category: string;
    subType?: string;
    thumbnail?: string;
    bodyContent: BodyBlock[];
    author?: { username: string };
    updatedAt: string;
    // Person fields
    dateOfBirth?: string;
    dateOfDeath?: string;
    profession?: string;
    education?: string;
    passingYear?: string;
    currentStatus?: string;
    sectorNo?: string;
    achievements?: string[];
    // Heritage fields
    period?: string;
    significance?: string;
    dateOfIncident?: string;
    involvedParties?: string[];
    // Occupation fields
    traditionalName?: string;
    toolsUsed?: string[];
    occupationStatus?: string;
    // Org fields
    foundedBy?: string;
    establishedDate?: string;
    headOfInstitution?: string;
    missionStatement?: string;
    // Location / Service
    address?: string;
    contactPhone?: string;
    locationLink?: string;
    destinations?: string[];
    entryFee?: string;
    bestTimeToVisit?: string;
    is24Hours?: boolean;
    transportType?: string;
    serviceType?: string;
}

function formatDate(dateStr: string) {
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

export default function EntryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { user } = useAuth();
    const [item, setItem] = useState<EntryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`/api/entry/${slug}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setItem(data.item ?? data);
                }
            })
            .catch(() => setError("Failed to load entry"))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="main-content" style={{ textAlign: "center", padding: "80px 0" }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "3rem" }}></i>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="main-content" style={{ textAlign: "center", padding: "80px 0" }}>
                <i className="fas fa-exclamation-circle" style={{ fontSize: "3rem", color: "#ff6b6b" }}></i>
                <h2 style={{ marginTop: "1rem" }}>{error || "Entry not found"}</h2>
                <Link href="/" className="btn-block" style={{ maxWidth: "200px", margin: "2rem auto" }}>
                    Go Home
                </Link>
            </div>
        );
    }

    const categorySlug = item.category.replace(/\s+/g, "-");
    const subTypeVal = item.subType || item.transportType || item.serviceType;

    // Render body content blocks
    const renderBlock = (block: BodyBlock) => {
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
                    <img src={normalizeImageUrl(imgUrl)} alt={imgCaption || item.title} referrerPolicy="no-referrer" style={{ maxWidth: "100%", height: "auto" }} />
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
            try {
                linkData = JSON.parse(block.content);
            } catch {
                linkData.url = block.content;
            }
            return (
                <div key={block.order} className="block-link">
                    <a href={linkData.url} target="_blank" rel="noopener noreferrer" className="external-link">
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
    };

    const sortedBlocks = [...item.bodyContent].sort((a, b) => a.order - b.order);

    // Build map URL
    let mapUrl = "";
    if (item.locationLink) {
        const trimmed = item.locationLink.trim();
        mapUrl = trimmed.startsWith("http") ? trimmed : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
    }

    return (
        <div className="main-content detail-page">
            <div className="detail-container">
                {/* LEFT: Main Content */}
                <article className="content-area">
                    <header className="entry-header">
                        <nav className="breadcrumb" style={{ textTransform: "capitalize" }}>
                            <Link href={`/archive/${categorySlug}`}>{item.category}</Link>
                            {item.subType && (
                                <>
                                    {" / "}
                                    <Link href={`/archive/${categorySlug}/${item.subType}`}>{item.subType}</Link>
                                </>
                            )}
                        </nav>
                        <h1>{item.title}</h1>
                        <hr />
                    </header>

                    <div className="entry-body">
                        {sortedBlocks.map(renderBlock)}
                    </div>

                    <footer className="entry-footer" style={{ marginTop: "2rem", opacity: 0.7 }}>
                        <p>Contributed by: <strong>{item.author?.username || "Anonymous"}</strong></p>
                        <p>Last Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
                        {user && (user.role === "admin" || user.role === "supervisor") && (
                            <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                                <Link
                                    href={`/admin/edit/${item._id}`}
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

                    {item.thumbnail && (
                        <div className="infobox-image">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={normalizeImageUrl(item.thumbnail)} alt="Thumbnail" referrerPolicy="no-referrer" />
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
                            {item.dateOfBirth && (
                                <tr><th>Birth</th><td>{formatDate(item.dateOfBirth)}</td></tr>
                            )}
                            {item.dateOfDeath && (
                                <tr><th>Death</th><td>{formatDate(item.dateOfDeath)}</td></tr>
                            )}
                            {item.profession && (
                                <tr><th>Profession</th><td>{item.profession}</td></tr>
                            )}
                            {item.education && (
                                <tr><th>Education</th><td>{item.education}</td></tr>
                            )}
                            {item.passingYear && (
                                <tr><th>Passing Year</th><td>{item.passingYear}</td></tr>
                            )}
                            {item.currentStatus && (
                                <tr><th>Status</th><td>{item.currentStatus}</td></tr>
                            )}
                            {item.sectorNo && (
                                <tr><th>Sector No</th><td>{item.sectorNo}</td></tr>
                            )}
                            {item.achievements && item.achievements.length > 0 && (
                                <tr>
                                    <th>Achievements</th>
                                    <td>
                                        <ul style={{ margin: 0, paddingLeft: "15px", fontSize: "0.9em" }}>
                                            {item.achievements.map((a, i) => <li key={i}>{a}</li>)}
                                        </ul>
                                    </td>
                                </tr>
                            )}
                            {item.period && (
                                <tr><th>Period</th><td>{item.period}</td></tr>
                            )}
                            {item.significance && (
                                <tr><th>Significance</th><td>{item.significance}</td></tr>
                            )}
                            {item.dateOfIncident && (
                                <tr><th>Date of Incident</th><td>{formatDate(item.dateOfIncident)}</td></tr>
                            )}
                            {item.involvedParties && item.involvedParties.length > 0 && (
                                <tr><th>Involved Parties</th><td>{item.involvedParties.join(", ")}</td></tr>
                            )}
                            {item.traditionalName && (
                                <tr><th>Traditional Name</th><td>{item.traditionalName}</td></tr>
                            )}
                            {item.toolsUsed && item.toolsUsed.length > 0 && (
                                <tr><th>Tools Used</th><td>{item.toolsUsed.join(", ")}</td></tr>
                            )}
                            {item.occupationStatus && (
                                <tr><th>Current Status</th><td>{item.occupationStatus}</td></tr>
                            )}
                            {item.foundedBy && (
                                <tr><th>Founded By</th><td>{item.foundedBy}</td></tr>
                            )}
                            {item.establishedDate && (
                                <tr><th>Established</th><td>{formatDate(item.establishedDate)}</td></tr>
                            )}
                            {item.headOfInstitution && (
                                <tr><th>Head / Manager</th><td>{item.headOfInstitution}</td></tr>
                            )}
                            {item.missionStatement && (
                                <tr>
                                    <th>Mission</th>
                                    <td><div style={{ fontSize: "0.85em", fontStyle: "italic" }}>&ldquo;{item.missionStatement}&rdquo;</div></td>
                                </tr>
                            )}
                            {item.address && (
                                <tr><th>Address</th><td>{item.address}</td></tr>
                            )}
                            {item.contactPhone && (
                                <tr><th>Contact</th><td>{item.contactPhone}</td></tr>
                            )}
                            {item.destinations && item.destinations.length > 0 && (
                                <tr><th>Destinations</th><td>{item.destinations.join(", ")}</td></tr>
                            )}
                            {item.entryFee && (
                                <tr><th>Entry Fee</th><td>{item.entryFee}</td></tr>
                            )}
                            {item.bestTimeToVisit && (
                                <tr><th>Best Time to Visit</th><td>{item.bestTimeToVisit}</td></tr>
                            )}
                            {item.category === "Emergency services" && typeof item.is24Hours !== "undefined" && (
                                <tr><th>24/7 Service</th><td>{item.is24Hours ? "Yes" : "No"}</td></tr>
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
