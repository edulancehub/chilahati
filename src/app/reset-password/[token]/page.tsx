"use client";

import { useState, use } from "react";
import Link from "next/link";
import FlashMessage from "@/components/FlashMessage";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [mismatch, setMismatch] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setMismatch(true);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to reset password");
            } else {
                setSuccess(data.message || "Password reset successful! You can now login.");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <Link href="/login" className="back-btn">
                <i className="fas fa-arrow-left"></i> Back to Login
            </Link>

            <div className="reset-container">
                <div className="reset-card">
                    <h1><i className="fas fa-lock"></i> Reset Your Password</h1>

                    <FlashMessage type="error" message={error} />
                    <FlashMessage type="success" message={success} />

                    <p>Enter your new password below.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="Min. 8 characters"
                                required
                                minLength={8}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <div className="help-text">Must be at least 8 characters long</div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Re-enter new password"
                                required
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    setMismatch(false);
                                }}
                                style={mismatch ? { borderColor: "#dc3545" } : {}}
                            />
                            {mismatch && (
                                <small style={{ color: "#dc3545", display: "block", marginTop: "5px" }}>
                                    Passwords do not match!
                                </small>
                            )}
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            <i className="fas fa-check"></i> {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
