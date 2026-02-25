"use client";

import { useState, useRef, useCallback, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import FlashMessage from "@/components/FlashMessage";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const SUB_TYPE_MAP: Record<string, string[]> = {
    institution: ["educational", "governmental", "Banks", "Religious", "other"],
    transport: ["bus", "train", "auto stand", "launch-ghat"],
    "Emergency services": ["hospitals", "police", "fire"],
};

const LOCATION_CATS = ["institution", "tourist spots", "transport", "Emergency services", "social works"];
const PERSON_CATS = ["notable people", "freedom fighters", "meritorious student", "hidden talent"];
const NARRATIVE_CATS = ["history", "culture", "Heartbreaking stories"];

interface Block {
    id: number;
    type: string;
    content: string;
    linkTitle?: string;
    linkUrl?: string;
}

function convertToDirectImageLink(url: string) {
    if (!url) return "";
    if (url.includes("lh3.googleusercontent.com/d/")) return url;
    const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
    if (idMatch) return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    return url;
}

function convertToEmbedUrl(url: string) {
    if (!url) return "";
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const gdMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (gdMatch) return `https://drive.google.com/file/d/${gdMatch[1]}/preview`;
    return url;
}

export default function AdminEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuth();
    const router = useRouter();

    const [category, setCategory] = useState("");
    const [subType, setSubType] = useState("");
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [thumbnail, setThumbnail] = useState("");

    const [locationLink, setLocationLink] = useState("");
    const [address, setAddress] = useState("");
    const [headOfInstitution, setHeadOfInstitution] = useState("");
    const [establishedDate, setEstablishedDate] = useState("");
    const [profession, setProfession] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [sectorNo, setSectorNo] = useState("");
    const [eventDate, setEventDate] = useState("");

    const [blocks, setBlocks] = useState<Block[]>([]);
    const nextId = useRef(1);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [quillReady, setQuillReady] = useState(false);

    useEffect(() => {
        setQuillReady(true);
    }, []);

    // Fetch existing item
    useEffect(() => {
        fetch(`/api/admin/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) { setError(data.error); return; }
                const item = data;
                setCategory(item.category || "");
                setSubType(item.subType || "");
                setTitle(item.title || "");
                setSlug(item.slug || "");
                setThumbnail(item.thumbnail || "");
                setLocationLink(item.locationLink || "");
                setAddress(item.address || "");
                setHeadOfInstitution(item.headOfInstitution || "");
                setEstablishedDate(item.establishedDate ? item.establishedDate.slice(0, 10) : "");
                setProfession(item.profession || "");
                setDateOfBirth(item.dateOfBirth ? item.dateOfBirth.slice(0, 10) : "");
                setSectorNo(item.sectorNo || "");
                setEventDate(item.dateOfIncident ? item.dateOfIncident.slice(0, 10) : "");

                if (item.bodyContent && item.bodyContent.length > 0) {
                    const sorted = [...item.bodyContent].sort((a: { order: number }, b: { order: number }) => a.order - b.order);
                    const loaded: Block[] = sorted.map((b: { type: string; content: string }, i: number) => {
                        const block: Block = { id: i + 1, type: b.type, content: b.content };
                        if (b.type === "link") {
                            try {
                                const parsed = JSON.parse(b.content);
                                block.linkTitle = parsed.title || "";
                                block.linkUrl = parsed.url || "";
                                block.content = "";
                            } catch {
                                block.linkUrl = b.content;
                            }
                        }
                        return block;
                    });
                    setBlocks(loaded);
                    nextId.current = loaded.length + 1;
                }
            })
            .catch(() => setError("Failed to load entry"))
            .finally(() => setFetching(false));
    }, [id]);

    const showLocation = LOCATION_CATS.includes(category) || !!SUB_TYPE_MAP[category];
    const showInstitution = category === "institution";
    const showPerson = PERSON_CATS.includes(category);
    const showNarrative = NARRATIVE_CATS.includes(category);
    const showDynamic = !!category && (showLocation || showInstitution || showPerson || showNarrative);

    const addBlock = useCallback((type: string) => {
        setBlocks((prev) => [...prev, { id: nextId.current++, type, content: "", linkTitle: "", linkUrl: "" }]);
    }, []);

    const updateBlock = useCallback((blockId: number, field: string, value: string) => {
        setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, [field]: value } : b)));
    }, []);

    const removeBlock = useCallback((blockId: number) => {
        setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setSuccess(""); setLoading(true);

        const bodyContent = blocks.map((block, index) => {
            let content = block.content;
            if (block.type === "image") content = convertToDirectImageLink(content);
            if (block.type === "video" || block.type === "pdf") content = convertToEmbedUrl(content);
            if (block.type === "link") content = JSON.stringify({ title: block.linkTitle, url: block.linkUrl });
            return { type: block.type, content, order: index };
        });

        const body: Record<string, unknown> = {
            category, title, slug,
            thumbnail: convertToDirectImageLink(thumbnail),
            bodyContent,
        };
        if (subType) body.subType = subType;
        if (locationLink) body.locationLink = locationLink;
        if (address) body.address = address;
        if (headOfInstitution) body.headOfInstitution = headOfInstitution;
        if (establishedDate) body.establishedDate = establishedDate;
        if (profession) body.profession = profession;
        if (dateOfBirth) body.dateOfBirth = dateOfBirth;
        if (sectorNo) body.sectorNo = sectorNo;
        if (eventDate) body.dateOfIncident = eventDate;

        try {
            const res = await fetch(`/api/admin/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to update"); } else {
                setSuccess("Entry updated successfully!");
                setTimeout(() => router.push(`/entry/${data.slug || slug}`), 1500);
            }
        } catch { setError("Network error"); }
        finally { setLoading(false); }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this entry? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Delete failed"); return; }
            router.push("/admin/content-management");
        } catch { setError("Network error"); }
    };

    if (!user || (user.role !== "admin" && user.role !== "supervisor")) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Access Denied</h2>
                    <Link href="/" className="btn-block" style={{ marginTop: "1rem" }}>Go Home</Link>
                </div>
            </div>
        );
    }

    if (fetching) {
        return (
            <div className="admin-container" style={{ textAlign: "center", padding: "80px 0" }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "3rem" }}></i>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1><i className="fas fa-edit"></i> Edit Entry</h1>
                <p>Update the archive entry details below.</p>
            </header>

            <FlashMessage type="success" message={success} />
            <FlashMessage type="error" message={error} />

            <form onSubmit={handleSubmit}>
                {/* Classification */}
                <div className="form-section">
                    <h3><i className="fas fa-sitemap"></i> Classification</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Main Category</label>
                            <select value={category} onChange={(e) => { setCategory(e.target.value); setSubType(""); }} required>
                                <option value="">-- Select --</option>
                                <option value="history">History</option>
                                <option value="culture">Culture</option>
                                <option value="institution">Institution</option>
                                <option value="notable people">Notable People</option>
                                <option value="freedom fighters">Freedom Fighters</option>
                                <option value="meritorious student">Meritorious Student</option>
                                <option value="hidden talent">Hidden Talent</option>
                                <option value="occupation">Occupation</option>
                                <option value="Heartbreaking stories">Heartbreaking Stories</option>
                                <option value="tourist spots">Tourist Spots</option>
                                <option value="transport">Transport</option>
                                <option value="Emergency services">Emergency Services</option>
                                <option value="social works">Social Works</option>
                            </select>
                        </div>
                        {SUB_TYPE_MAP[category] && (
                            <div className="form-group">
                                <label>Sub-Category</label>
                                <select value={subType} onChange={(e) => setSubType(e.target.value)}>
                                    <option value="">-- Select --</option>
                                    {SUB_TYPE_MAP[category].map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Basic Info */}
                <div className="form-section">
                    <h3><i className="fas fa-info-circle"></i> Basic Info</h3>
                    <div className="form-group">
                        <label>Title</label>
                        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Slug (URL Link)</label>
                        <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Thumbnail</label>
                        <input type="text" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
                    </div>
                </div>

                {/* Dynamic Details */}
                {showDynamic && (
                    <div className="form-section">
                        <h3><i className="fas fa-list-ul"></i> Specific Details</h3>
                        {showLocation && (
                            <>
                                <label>Google Maps Link</label>
                                <textarea rows={2} value={locationLink} onChange={(e) => setLocationLink(e.target.value)} />
                                <label>Physical Address</label>
                                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </>
                        )}
                        {showInstitution && (
                            <>
                                <label>Head of Institution</label>
                                <input type="text" value={headOfInstitution} onChange={(e) => setHeadOfInstitution(e.target.value)} />
                                <label>Established Date</label>
                                <input type="date" value={establishedDate} onChange={(e) => setEstablishedDate(e.target.value)} />
                            </>
                        )}
                        {showPerson && (
                            <>
                                <label>Education/Profession</label>
                                <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} />
                                <label>Date of Birth</label>
                                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                                <label>Sector No</label>
                                <input type="text" value={sectorNo} onChange={(e) => setSectorNo(e.target.value)} />
                            </>
                        )}
                        {showNarrative && (
                            <>
                                <label>Date of Event/Incident</label>
                                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                            </>
                        )}
                    </div>
                )}

                {/* Block Editor */}
                <div className="form-section">
                    <h3><i className="fas fa-edit"></i> Page Content</h3>
                    <div className="toolbar">
                        <button type="button" className="tool-btn" onClick={() => addBlock("heading")}><i className="fas fa-heading"></i> Heading</button>
                        <button type="button" className="tool-btn" onClick={() => addBlock("paragraph")}><i className="fas fa-paragraph"></i> Rich Text</button>
                        <button type="button" className="tool-btn" onClick={() => addBlock("image")}><i className="fas fa-image"></i> Image</button>
                        <button type="button" className="tool-btn" onClick={() => addBlock("video")}><i className="fas fa-video"></i> Video</button>
                        <button type="button" className="tool-btn" onClick={() => addBlock("link")}><i className="fas fa-link"></i> Link</button>
                        <button type="button" className="tool-btn" onClick={() => addBlock("pdf")}><i className="fas fa-file-pdf"></i> PDF</button>
                    </div>

                    <div className="block-editor">
                        {blocks.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px", color: "#888" }}>
                                <p>No content blocks. Click buttons above to add.</p>
                            </div>
                        ) : (
                            blocks.map((block) => (
                                <div key={block.id} className="block-item" data-type={block.type}>
                                    <span className="block-label">{block.type.toUpperCase()}</span>

                                    {block.type === "heading" && (
                                        <input type="text" className="block-input" placeholder="Enter Sub-heading"
                                            value={block.content} onChange={(e) => updateBlock(block.id, "content", e.target.value)} />
                                    )}

                                    {block.type === "paragraph" && quillReady && (
                                        <ReactQuill theme="snow" value={block.content}
                                            onChange={(val: string) => updateBlock(block.id, "content", val)} />
                                    )}

                                    {block.type === "image" && (
                                        <input type="text" className="block-input" placeholder="Image URL"
                                            value={block.content} onChange={(e) => updateBlock(block.id, "content", e.target.value)} />
                                    )}

                                    {block.type === "video" && (
                                        <input type="text" className="block-input" placeholder="Video URL"
                                            value={block.content} onChange={(e) => updateBlock(block.id, "content", e.target.value)} />
                                    )}

                                    {block.type === "pdf" && (
                                        <input type="text" className="block-input" placeholder="PDF URL"
                                            value={block.content} onChange={(e) => updateBlock(block.id, "content", e.target.value)} />
                                    )}

                                    {block.type === "link" && (
                                        <>
                                            <input type="text" className="block-input" placeholder="Link Title"
                                                value={block.linkTitle || ""} onChange={(e) => updateBlock(block.id, "linkTitle", e.target.value)} />
                                            <input type="text" className="block-input" placeholder="URL"
                                                value={block.linkUrl || ""} onChange={(e) => updateBlock(block.id, "linkUrl", e.target.value)} />
                                        </>
                                    )}

                                    <button type="button" className="remove-btn" onClick={() => removeBlock(block.id)}>&times;</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="btn-group">
                    <button type="submit" className="btn-block save-btn" disabled={loading}>
                        {loading ? "Saving..." : "Update Entry"}
                    </button>
                    <button type="button" className="btn-block delete-btn" onClick={handleDelete}>
                        <i className="fas fa-trash-alt"></i> Delete Entry
                    </button>
                </div>
                <Link href="/admin/content-management" className="btn-block cancel-btn" style={{ textAlign: "center", display: "block" }}>
                    Cancel
                </Link>
            </form>
        </div>
    );
}
