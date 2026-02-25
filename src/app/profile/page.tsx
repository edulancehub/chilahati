"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import FlashMessage from "@/components/FlashMessage";

export default function ProfilePage() {
    const { user, refresh, logout } = useAuth();
    const router = useRouter();

    const [newUsername, setNewUsername] = useState("");
    const [usernamePassword, setUsernamePassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [deletePassword, setDeletePassword] = useState("");
    const [mismatch, setMismatch] = useState(false);

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
                body: JSON.stringify({ newUsername, password: usernamePassword }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); } else {
                setSuccess(data.message || "Username updated!");
                setNewUsername(""); setUsernamePassword("");
                await refresh();
            }
        } catch { setError("Network error"); }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setSuccess("");
        if (newPassword !== confirmNewPassword) { setMismatch(true); return; }
        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); } else {
                setSuccess(data.message || "Password changed!");
                setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
            }
        } catch { setError("Network error"); }
    };

    const handleForgotPassword = async () => {
        setError(""); setSuccess("");
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); } else { setSuccess(data.message || "Reset email sent!"); }
        } catch { setError("Network error"); }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm("Are you absolutely sure you want to delete your account? This action cannot be undone!")) return;
        setError(""); setSuccess("");
        try {
            const res = await fetch("/api/user/delete-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: deletePassword }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); } else {
                await logout();
                router.push("/");
            }
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
                            <div className="form-group">
                                <label htmlFor="usernamePassword">Confirm Password</label>
                                <input type="password" id="usernamePassword" placeholder="Enter your current password" required
                                    value={usernamePassword} onChange={(e) => setUsernamePassword(e.target.value)} />
                            </div>
                            <button type="submit" className="btn-primary">
                                <i className="fas fa-save"></i> Update Username
                            </button>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="form-section">
                        <h3><i className="fas fa-key"></i> Change Password</h3>
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label htmlFor="currentPassword">Current Password</label>
                                <input type="password" id="currentPassword" placeholder="Enter current password" required
                                    value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="newPassword">New Password</label>
                                <input type="password" id="newPassword" placeholder="Min. 8 characters" required minLength={8}
                                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                                <input type="password" id="confirmNewPassword" placeholder="Re-enter new password" required
                                    value={confirmNewPassword}
                                    onChange={(e) => { setConfirmNewPassword(e.target.value); setMismatch(false); }}
                                    style={mismatch ? { borderColor: "#dc3545" } : {}} />
                                {mismatch && <small style={{ color: "#dc3545", display: "block", marginTop: "5px" }}>Passwords do not match!</small>}
                            </div>
                            <button type="submit" className="btn-primary">
                                <i className="fas fa-lock"></i> Change Password
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

                    {/* Delete Account */}
                    <div className="form-section" style={{ border: "2px solid #dc3545", background: "#fff5f5" }}>
                        <h3 style={{ color: "#dc3545" }}><i className="fas fa-exclamation-triangle"></i> Danger Zone</h3>
                        <p style={{ color: "#721c24", marginBottom: "1rem", fontWeight: 500 }}>
                            ⚠️ Warning: Deleting your account is permanent and cannot be undone.
                        </p>
                        <form onSubmit={handleDeleteAccount}>
                            <div className="form-group">
                                <label htmlFor="deletePassword">Confirm Your Password</label>
                                <input type="password" id="deletePassword" placeholder="Enter your password to confirm" required
                                    value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
                            </div>
                            <button type="submit" className="btn-primary" style={{ background: "#dc3545" }}>
                                <i className="fas fa-trash-alt"></i> Delete My Account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
