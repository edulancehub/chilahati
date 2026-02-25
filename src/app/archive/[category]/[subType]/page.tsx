"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface ArchiveItem {
    _id: string;
    title: string;
    slug: string;
    category: string;
    subType?: string;
    thumbnail?: string;
}

export default function ArchiveSubTypePage({
    params,
}: {
    params: Promise<{ category: string; subType: string }>;
}) {
    const { category, subType } = use(params);
    const [items, setItems] = useState<ArchiveItem[]>([]);
    const [title, setTitle] = useState("");
    const [displayCategory, setDisplayCategory] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/archive/${category}/${subType}`)
            .then((res) => res.json())
            .then((data) => {
                setItems(data.items || []);
                setTitle(data.title || subType);
                setDisplayCategory(data.category || category);
            })
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [category, subType]);

    if (loading) {
        return (
            <div className="main-content" style={{ textAlign: "center", padding: "80px 0" }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: "3rem" }}></i>
            </div>
        );
    }

    return (
        <div className="main-content">
            <header style={{ marginBottom: "2rem" }}>
                <nav style={{ marginBottom: "10px", fontSize: "0.9rem", opacity: 0.7, textTransform: "capitalize" }}>
                    <Link href="/" style={{ color: "white", textTransform: "none" }}>Home</Link> /{" "}
                    <Link href={`/archive/${category}`} style={{ color: "white" }}>{displayCategory}</Link> /{" "}
                    <Link href={`/archive/${category}/${subType}`} style={{ color: "white" }}>
                        {decodeURIComponent(subType)}
                    </Link>
                </nav>
                <h1 style={{ textTransform: "capitalize" }}>{title}</h1>
                <p>{items.length} entries found in this archive.</p>
            </header>

            <div className="menu-grid list-grid">
                {items.length > 0 ? (
                    items.map((item) => (
                        <Link key={item._id} href={`/entry/${item.slug}`} className="card item-card">
                            {item.thumbnail ? (
                                <div className="item-thumb">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        referrerPolicy="no-referrer"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                </div>
                            ) : (
                                <div className="item-thumb item-thumb--placeholder">
                                    <i className="fas fa-image"></i>
                                </div>
                            )}
                            <div className="card-content">
                                <h3>{item.title}</h3>
                                <p className="item-excerpt">Click to read the full archive...</p>
                                <div className="item-meta" style={{ textTransform: "capitalize" }}>
                                    <span className="badge">{item.category}</span>
                                    {item.subType && (
                                        <>
                                            <span className="muted"> &bull; </span>
                                            <span className="muted">{item.subType}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <i className="fas fa-book-open card-arrow"></i>
                        </Link>
                    ))
                ) : (
                    <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                        <i className="fas fa-inbox empty-icon"></i>
                        <p className="empty-text">No entries found here yet. Be the first to contribute!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
