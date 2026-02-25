"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import FlashMessage from "@/components/FlashMessage";

interface ContentItem {
    _id: string;
    title: string;
    slug: string;
    category: string;
    subType?: string;
    createdAt: string;
}

export default function ContentManagementPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<ContentItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const fetchItems = useCallback(async (page: number, q: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page) });
            if (q) params.set("q", q);
            const res = await fetch(`/api/admin/content-management?${params}`);
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Failed to load"); return; }
            setItems(data.items || []);
            setCurrentPage(data.currentPage || 1);
            setTotalPages(data.totalPages || 0);
            setTotalItems(data.totalItems || 0);
        } catch { setError("Network error"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchItems(1, "");
    }, [fetchItems]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchItems(1, searchQuery);
    };

    const clearSearch = () => {
        setSearchQuery("");
        fetchItems(1, "");
    };

    const deleteItem = async (itemId: string) => {
        if (!confirm("Are you sure you want to delete this content? This action cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/${itemId}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Delete failed"); return; }
            setSuccess("Content deleted successfully");
            setItems((prev) => prev.filter((i) => i._id !== itemId));
        } catch { setError("Network error"); }
    };

    if (!user) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Login Required</h2>
                    <Link href="/login" className="btn-block" style={{ marginTop: "1rem" }}>Go to Login</Link>
                </div>
            </div>
        );
    }

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1><i className="fas fa-file-alt"></i> Content Management</h1>
                <p>Manage the entries you have contributed to the archive.</p>
                <div style={{ marginTop: "1.5rem", maxWidth: "500px" }}>
                    <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                            type="text"
                            placeholder="Search your entries by title, category, etc..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1, padding: "0.8rem 1rem", borderRadius: "8px", border: "none",
                                fontSize: "0.95rem", outline: "none", boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                            }}
                        />
                        <button type="submit" style={{
                            padding: "0 1.5rem", borderRadius: "8px", background: "#fff", color: "#2a5298",
                            border: "none", fontWeight: 600, cursor: "pointer",
                        }}>
                            <i className="fas fa-search"></i> Search
                        </button>
                    </form>
                </div>
            </header>

            <FlashMessage type="success" message={success} />
            <FlashMessage type="error" message={error} />

            {searchQuery && (
                <div style={{
                    marginBottom: "1rem", padding: "0.8rem 1.2rem",
                    background: "rgba(74,144,226,0.1)", color: "inherit",
                    borderRadius: "8px", display: "flex", justifyContent: "space-between",
                    alignItems: "center", border: "1px solid rgba(74,144,226,0.2)",
                }}>
                    <span>
                        <i className="fas fa-info-circle" style={{ color: "#4a90e2", marginRight: "5px" }}></i>
                        Showing results for: <strong>&ldquo;{searchQuery}&rdquo;</strong> ({totalItems} found)
                    </span>
                    <button onClick={clearSearch} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "0.9rem" }}>
                        <i className="fas fa-times-circle"></i> Clear Search
                    </button>
                </div>
            )}

            <div className="management-list">
                {loading ? (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: "2rem" }}></i>
                    </div>
                ) : items.length > 0 ? (
                    items.map((item) => (
                        <div key={item._id} className="management-item" id={`item-${item._id}`}>
                            <div className="item-info">
                                <h3>{item.title}</h3>
                                <div className="item-meta">
                                    <span className="item-category">{item.category}</span>
                                    {item.subType && <span><i className="fas fa-tag"></i> {item.subType}</span>}
                                    <span><i className="far fa-calendar-alt"></i> {new Date(item.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="item-actions">
                                <Link href={`/entry/${item.slug}`} target="_blank" className="action-btn btn-view" title="View Entry">
                                    <i className="fas fa-eye"></i> View
                                </Link>
                                <Link href={`/admin/edit/${item._id}`} className="action-btn btn-edit" title="Edit Entry">
                                    <i className="fas fa-edit"></i> Edit
                                </Link>
                                <button onClick={() => deleteItem(item._id)} className="action-btn btn-delete" title="Delete Entry">
                                    <i className="fas fa-trash-alt"></i> Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <i className={searchQuery ? "fas fa-search-minus" : "far fa-folder-open"} style={{ fontSize: "3rem", opacity: 0.5 }}></i>
                        <h2>{searchQuery ? "No matches found" : "No contents found"}</h2>
                        <p>{searchQuery ? `We couldn't find any entries matching "${searchQuery}".` : "You haven't added any entries to the archive yet."}</p>
                        {searchQuery ? (
                            <button onClick={clearSearch} className="action-btn btn-view" style={{ marginTop: "1rem" }}>
                                <i className="fas fa-sync-alt"></i> View All Content
                            </button>
                        ) : (
                            <Link href="/admin/add" className="action-btn btn-edit" style={{ marginTop: "1rem" }}>
                                <i className="fas fa-plus"></i> Add New Entry
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="pagination" style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "2rem" }}>
                    {currentPage > 1 && (
                        <button onClick={() => fetchItems(currentPage - 1, searchQuery)} className="action-btn btn-view">&laquo; Prev</button>
                    )}
                    {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((i) => (
                        <button key={i} onClick={() => fetchItems(i, searchQuery)}
                            className={`action-btn ${i === currentPage ? "btn-edit" : "btn-view"}`}
                            style={{ minWidth: "40px", justifyContent: "center" }}>{i}</button>
                    ))}
                    {currentPage < totalPages && (
                        <button onClick={() => fetchItems(currentPage + 1, searchQuery)} className="action-btn btn-view">Next &raquo;</button>
                    )}
                </div>
            )}
        </div>
    );
}
