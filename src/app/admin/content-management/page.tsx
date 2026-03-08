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

interface ContactItem {
    id: string;
    name: string;
    email: string;
    message: string;
    createdAt: string;
}

interface SubmissionItem {
    _id: string;
    title: string;
    category: string;
    subType?: string;
    message: string;
    sourceLink?: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    adminNotes?: string;
    submittedBy?: {
        username?: string;
        email?: string;
    };
    publishedEntry?: {
        slug: string;
        title: string;
    };
}

export default function ContentManagementPage() {
    const { user } = useAuth();
    const [items, setItems] = useState<ContentItem[]>([]);
    const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
    const [contacts, setContacts] = useState<ContactItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const fetchContacts = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/contacts");
            const data = await res.json();
            if (res.ok) setContacts(data.contacts || []);
        } catch { /* ignore */ }
    }, []);

    const fetchSubmissions = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/submissions");
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to load submissions");
                return;
            }
            setSubmissions(data.submissions || []);
        } catch {
            setError("Network error");
        }
    }, []);

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
        fetchSubmissions();
        fetchContacts();
    }, [fetchItems, fetchSubmissions, fetchContacts]);

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

    const deleteSubmission = async (submissionId: string) => {
        if (!confirm("Delete this submission permanently? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/submissions/${submissionId}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) { setError(data.error || "Delete failed"); return; }
            setSuccess("Submission deleted.");
            setSubmissions((prev) => prev.filter((s) => s._id !== submissionId));
        } catch { setError("Network error"); }
    };

    const reviewSubmission = async (submissionId: string, action: "approve" | "reject") => {
        const adminNotes = action === "reject"
            ? window.prompt("Optional rejection note for this contributor:", "") || ""
            : "";

        try {
            const res = await fetch(`/api/admin/submissions/${submissionId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, adminNotes }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Submission review failed");
                return;
            }

            setSuccess(action === "approve" ? "Submission approved and published." : "Submission rejected.");
            await fetchSubmissions();
            await fetchItems(currentPage, searchQuery);
        } catch {
            setError("Network error");
        }
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

    if (user.role !== "admin") {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Access Denied</h2>
                    <p style={{ color: "rgba(255,255,255,0.7)" }}>Only admin accounts can review or publish archive content.</p>
                    <Link href="/" className="btn-block" style={{ marginTop: "1rem" }}>Go Home</Link>
                </div>
            </div>
        );
    }

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    return (
        <div className="admin-container">
            <header className="admin-header">
                <h1><i className="fas fa-shield-alt"></i> Admin Panel</h1>
                <p>Review submissions, manage all archive entries, and view contact messages.</p>
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

            <section className="management-list" style={{ marginBottom: "2rem" }}>
                <div className="management-item" style={{ display: "block" }}>
                    <div className="item-info" style={{ marginBottom: "1rem" }}>
                        <h3>Community Submissions</h3>
                        <div className="item-meta">
                            <span className="item-category">{submissions.filter((submission) => submission.status === "pending").length} pending</span>
                            <span><i className="fas fa-users"></i> Contributor stories need admin approval before publishing</span>
                        </div>
                    </div>

                    {submissions.length === 0 ? (
                        <p style={{ opacity: 0.8 }}>No community submissions yet.</p>
                    ) : (
                        submissions.map((submission) => (
                            <div key={submission._id} className="management-item" style={{ marginTop: "1rem" }}>
                                <div className="item-info">
                                    <h3>{submission.title}</h3>
                                    <div className="item-meta" style={{ flexWrap: "wrap" }}>
                                        <span className="item-category">{submission.category}</span>
                                        {submission.subType && <span><i className="fas fa-tag"></i> {submission.subType}</span>}
                                        <span><i className="fas fa-user"></i> {submission.submittedBy?.username || "Unknown contributor"}</span>
                                        <span><i className="fas fa-envelope"></i> {submission.submittedBy?.email || "No email"}</span>
                                        <span><i className="far fa-calendar-alt"></i> {new Date(submission.createdAt).toLocaleDateString()}</span>
                                        <span style={{ textTransform: "capitalize" }}><i className="fas fa-flag"></i> {submission.status}</span>
                                    </div>
                                    <p style={{ marginTop: "0.85rem", lineHeight: 1.6 }}>{submission.message}</p>
                                    {submission.sourceLink && (
                                        <p style={{ marginTop: "0.65rem" }}>
                                            <a href={submission.sourceLink} target="_blank" rel="noopener noreferrer" className="action-btn btn-view">
                                                <i className="fas fa-link"></i> Open Source Link
                                            </a>
                                        </p>
                                    )}
                                    {submission.publishedEntry && (
                                        <p style={{ marginTop: "0.65rem" }}>
                                            Published as <Link href={`/entry/${submission.publishedEntry.slug}`} target="_blank">{submission.publishedEntry.title}</Link>
                                        </p>
                                    )}
                                    {submission.adminNotes && (
                                        <p style={{ marginTop: "0.65rem", opacity: 0.9 }}>
                                            <strong>Admin note:</strong> {submission.adminNotes}
                                        </p>
                                    )}
                                </div>

                                {submission.status === "pending" && (
                                    <div className="item-actions">
                                        <button onClick={() => reviewSubmission(submission._id, "approve")} className="action-btn btn-edit" title="Approve and publish">
                                            <i className="fas fa-check"></i> Approve
                                        </button>
                                        <button onClick={() => reviewSubmission(submission._id, "reject")} className="action-btn btn-delete" title="Reject submission">
                                            <i className="fas fa-times"></i> Reject
                                        </button>
                                    </div>
                                )}
                                <div className="item-actions" style={{ marginTop: submission.status === "pending" ? "0.5rem" : 0 }}>
                                    <button onClick={() => deleteSubmission(submission._id)} className="action-btn btn-delete" title="Delete submission permanently">
                                        <i className="fas fa-trash-alt"></i> Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* ── Contact Form Submissions ── */}
            <section className="management-list" style={{ marginBottom: "2rem" }}>
                <div className="management-item" style={{ display: "block" }}>
                    <div className="item-info" style={{ marginBottom: "1rem" }}>
                        <h3><i className="fas fa-envelope"></i> Contact Form Messages</h3>
                        <div className="item-meta">
                            <span className="item-category">{contacts.length} total</span>
                            <span>Messages sent via the Contact page</span>
                        </div>
                    </div>
                    {contacts.length === 0 ? (
                        <p style={{ opacity: 0.8 }}>No contact messages yet.</p>
                    ) : (
                        contacts.map((c) => (
                            <div key={c.id} className="management-item" style={{ marginTop: "1rem" }}>
                                <div className="item-info">
                                    <h3>{c.name}</h3>
                                    <div className="item-meta" style={{ flexWrap: "wrap" }}>
                                        <span><i className="fas fa-envelope"></i> {c.email}</span>
                                        <span><i className="far fa-calendar-alt"></i> {new Date(c.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p style={{ marginTop: "0.75rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{c.message}</p>
                                </div>
                                <div className="item-actions">
                                    <a href={`mailto:${c.email}`} className="action-btn btn-edit">
                                        <i className="fas fa-reply"></i> Reply
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

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
                        <p>{searchQuery ? `We couldn't find any entries matching "${searchQuery}".` : "No archive entries have been published yet."}</p>
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
