"use client";

import { useState } from "react";
import Link from "next/link";
import FlashMessage from "@/components/FlashMessage";
import { getFirebaseClientAuth } from "@/lib/firebase/client";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await sendPasswordResetEmail(getFirebaseClientAuth(), email);
            setSuccess("Password reset email sent. Firebase will open its secure reset flow from the email link.");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to send reset link";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Forgot Password</h2>
                <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "20px", textAlign: "center" }}>
                    Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <FlashMessage type="error" message={error} />
                <FlashMessage type="success" message={success} />

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-block" disabled={loading}>
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="auth-footer">
                    Remember your password?
                    <Link href="/login" className="auth-link">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}
