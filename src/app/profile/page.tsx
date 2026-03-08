"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import FlashMessage from "@/components/FlashMessage";
import { getFirebaseClientAuth } from "@/lib/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";

interface MySubmission {
    id: string;
    title: string;
    category: string;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
    adminNotes?: string;
    publishedSlug?: string;
}

export default function ProfilePage() {
    const { user, refresh } = useAuth();

    const [newUsername, setNewUsername] = useState("");
    const [mySubmissions, setMySubmissions] = useState<MySubmission[]>([]);
    const [submissionsLoaded, setSubmissionsLoaded] = useState(false);

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;
        fetch("/api/user/submissions")
            .then((r) => r.json())
            .then((d) => { if (d.submissions) setMySubmissions(d.submissions); })
            .catch(() => {})
            .finally(() => setSubmissionsLoaded(true));
    }, [user]);

    if (!user) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2>Not Logged In</h2>
                    <p style={{ color: "rgba(255,255,255,0.7)" }}>Please log in to view your profile.</p>
                    <Link href="/login" className="btn-block" style={{ marginTop: "1rem" }}>Go to Login</Link>
                </div>
            </div>
        );
    }

    const handleUpdateUsername = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setSuccess("");
        try {
            const res = await fetch("/api/user/update-username", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newUsername }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); } else {
                setSuccess(data.message || "Username updated!");
                setNewUsername("");
                await refresh();
            }
        } catch { setError("Network error"); }
    };

    const handleForgotPassword = async () => {
        setError(""); setSuccess("");
        try {
            await sendPasswordResetEmail(getFirebaseClientAuth(), user.email);
            setSuccess("Password reset email sent. Firebase will handle the secure password reset flow.");
        } catch { setError("Network error"); }
    };

    return (
        <div className="container">
            <Link href="/" className="back-btn">
                <i className="fas fa-arrow-left"></i> Back to Home
            </Link>

            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <i className="fas fa-user"></i>
                    </div>
                    <h1>{user.username}</h1>
                    <span className="profile-role"><i className="fas fa-shield-alt"></i> {user.role}</span>
                </div>

                <div className="profile-body">
                    <FlashMessage type="success" message={success} />
                    <FlashMessage type="error" message={error} />

                    {/* Account Info */}
                    <div className="info-section">
                        <h2><i className="fas fa-info-circle"></i> Account Information</h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-label">Email Address</div>
                                <div className="info-value">{user.email}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Account Status</div>
                                <div className="info-value">
                                    <i className="fas fa-check-circle" style={{ color: "#28a745" }}></i> Active
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Sign-in Method</div>
                                <div className="info-value" style={{ textTransform: "capitalize" }}>{user.provider || "password"}</div>
                            </div>
                        </div>
                    </div>

                    {/* Update Username */}
                    <div className="form-section">
                        <h3><i className="fas fa-edit"></i> Change Username</h3>
                        <form onSubmit={handleUpdateUsername}>
                            <div className="form-group">
                                <label htmlFor="newUsername">New Username</label>
                                <input type="text" id="newUsername" placeholder="Enter new username" required minLength={3} maxLength={30}
                                    value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                                <div className="help-text">Must be at least 3 characters long and unique</div>
                            </div>
                            <button type="submit" className="btn-primary">
                                <i className="fas fa-save"></i> Update Username
                            </button>
                        </form>
                    </div>

                    {/* Forgot Password */}
                    <div className="form-section">
                        <h3><i className="fas fa-question-circle"></i> Forgot Your Password?</h3>
                        <p style={{ color: "#666", marginBottom: "1rem" }}>
                            If you can&apos;t remember your password, we can send you a password reset link via email.
                        </p>
                        <button type="button" className="btn-secondary" onClick={handleForgotPassword}>
                            <i className="fas fa-envelope"></i> Send Password Reset Email
                        </button>
                    </div>

                    {/* My Contributions */}
                    <div className="info-section" style={{ marginTop: "2rem" }}>
                        <h2><i className="fas fa-hand-holding-heart"></i> My Contributions</h2>
                        {!submissionsLoaded ? (
                            <p style={{ color: "#888" }}><i className="fas fa-spinner fa-spin"></i> Loading…</p>
                        ) : mySubmissions.length === 0 ? (
                            <p style={{ color: "#888" }}>
                                You have not submitted any contributions yet.{" "}
                                <Link href="/contribute" style={{ color: "#4a90e2" }}>Contribute now</Link>
                            </p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "0.75rem" }}>
                                {mySubmissions.map((sub) => (
                                    <div key={sub.id} style={{
                                        background: "rgba(0,0,0,0.06)", borderRadius: "10px",
                                        padding: "1rem 1.2rem", border: "1px solid rgba(0,0,0,0.08)",
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                                            <strong style={{ fontSize: "1rem" }}>{sub.title}</strong>
                                            <span style={{
                                                fontSize: "0.8rem", fontWeight: 700, padding: "2px 10px",
                                                borderRadius: "20px", textTransform: "capitalize",
                                                background: sub.status === "pending" ? "#fef3c7" : sub.status === "approved" ? "#d1fae5" : "#fee2e2",
                                                color: sub.status === "pending" ? "#92400e" : sub.status === "approved" ? "#065f46" : "#991b1b",
                                            }}>
                                                {sub.status === "pending" && <><i className="fas fa-clock"></i> </>}
                                                {sub.status === "approved" && <><i className="fas fa-check-circle"></i> </>}
                                                {sub.status === "rejected" && <><i className="fas fa-times-circle"></i> </>}
                                                {sub.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "0.82rem", color: "#888", marginTop: "0.3rem" }}>
                                            {sub.category} &bull; {new Date(sub.createdAt).toLocaleDateString()}
                                        </div>
                                        {sub.adminNotes && (
                                            <div style={{
                                                marginTop: "0.65rem", padding: "0.55rem 0.9rem",
                                                background: "rgba(74,144,226,0.08)", borderLeft: "3px solid #4a90e2",
                                                borderRadius: "0 6px 6px 0", fontSize: "0.88rem", lineHeight: 1.6,
                                            }}>
                                                <strong><i className="fas fa-comment-alt" style={{ color: "#4a90e2", marginRight: "5px" }}></i>Note from admin:</strong> {sub.adminNotes}
                                            </div>
                                        )}
                                        {sub.publishedSlug && (
                                            <div style={{ marginTop: "0.5rem" }}>
                                                <Link href={`/entry/${sub.publishedSlug}`} style={{ color: "#4a90e2", fontSize: "0.88rem" }}>
                                                    <i className="fas fa-external-link-alt"></i> View published entry
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
