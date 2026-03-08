"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import FlashMessage from "@/components/FlashMessage";

const SUB_TYPE_MAP: Record<string, string[]> = {
    institution: ["educational", "governmental", "Banks", "Religious", "other"],
    transport: ["bus", "train", "auto stand", "launch-ghat"],
    "Emergency services": ["hospitals", "police", "fire"],
};

export default function ContributePage() {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("history");
    const [subType, setSubType] = useState("");
    const [message, setMessage] = useState("");
    const [sourceLink, setSourceLink] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Login Required</h2>
                    <p style={{ color: "rgba(255,255,255,0.7)" }}>Please log in to contribute.</p>
                    <Link href="/login" className="btn-block" style={{ marginTop: "1rem" }}>Go to Login</Link>
                </div>
            </div>
        );
    }

    if (user.role === "admin") {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2><i className="fas fa-shield-alt"></i> Admin Panel</h2>
                    <p style={{ color: "rgba(255,255,255,0.7)", marginTop: "0.75rem" }}>
                        আপনি এডমিন। কমিউনিটি সাবমিশন রিভিউ ও পাবলিশ করতে Admin Panel-এ যান।
                    </p>
                    <Link href="/admin/content-management" className="btn-block" style={{ marginTop: "1.25rem" }}>
                        <i className="fas fa-tasks"></i> Review Submissions
                    </Link>
                    <Link href="/admin/add" className="btn-block" style={{ marginTop: "0.75rem", background: "rgba(255,255,255,0.15)" }}>
                        <i className="fas fa-plus-circle"></i> Add New Entry
                    </Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setSuccess(""); setLoading(true);
        try {
            const res = await fetch("/api/contribute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, subType, message, sourceLink }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); } else {
                setSuccess(data.message || "Thank you for your contribution!");
                setTitle("");
                setMessage("");
                setSourceLink("");
                setSubType("");
            }
        } catch { setError("Network error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="container">
            <div className="contribute-card">
                <div className="contribute-header">
                    <h2><i className="fas fa-hand-holding-heart"></i> Contribute</h2>
                    <p>Share a story or reference with the archive team. Community submissions stay private until an admin approves and publishes them.</p>
                </div>

                <FlashMessage type="success" message={success} />
                <FlashMessage type="error" message={error} />

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Submission Title</label>
                        <input
                            id="title"
                            className="form-control"
                            placeholder="What should this archive entry be called?"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            className="form-control"
                            value={category}
                            onChange={(e) => { setCategory(e.target.value); setSubType(""); }}
                            required
                        >
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
                            <label htmlFor="subType">Sub-category</label>
                            <select id="subType" className="form-control" value={subType} onChange={(e) => setSubType(e.target.value)}>
                                <option value="">Select if relevant</option>
                                {SUB_TYPE_MAP[category].map((value) => (
                                    <option key={value} value={value}>{value}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="message">Your Message</label>
                        <textarea
                            id="message"
                            className="message-area"
                            placeholder="Type your information or contribution here..."
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="sourceLink">Source Link</label>
                        <input
                            id="sourceLink"
                            className="form-control"
                            placeholder="Optional Google Drive, article, or reference link"
                            value={sourceLink}
                            onChange={(e) => setSourceLink(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        <i className="fas fa-paper-plane"></i> {loading ? "Submitting..." : "Submit for Review"}
                    </button>
                </form>

                <div className="contribute-footer">
                    <p>Thank you for being a part of this community, <strong>{user.username}</strong>!</p>
                </div>
            </div>
        </div>
    );
}
