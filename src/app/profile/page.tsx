"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import FlashMessage from "@/components/FlashMessage";
import { getFirebaseClientAuth } from "@/lib/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ProfilePage() {
    const { user, refresh } = useAuth();

    const [newUsername, setNewUsername] = useState("");

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

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
                </div>
            </div>
        </div>
    );
}
