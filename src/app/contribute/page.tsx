"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import FlashMessage from "@/components/FlashMessage";

export default function ContributePage() {
    const { user } = useAuth();
    const [message, setMessage] = useState("");
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setSuccess(""); setLoading(true);
        try {
            const res = await fetch("/api/contribute", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); } else {
                setSuccess(data.message || "Thank you for your contribution!");
                setMessage("");
            }
        } catch { setError("Network error"); }
        finally { setLoading(false); }
    };

    return (
        <div className="container">
            <div className="contribute-card">
                <div className="contribute-header">
                    <h2><i className="fas fa-hand-holding-heart"></i> Contribute</h2>
                    <p>Share your stories, information, or feedback to help us build a better archive for Chilahati.</p>
                </div>

                <FlashMessage type="success" message={success} />
                <FlashMessage type="error" message={error} />

                <form onSubmit={handleSubmit}>
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

                    <button type="submit" className="submit-btn" disabled={loading}>
                        <i className="fas fa-paper-plane"></i> {loading ? "Sending..." : "Send Message"}
                    </button>
                </form>

                <div className="contribute-footer">
                    <p>Thank you for being a part of this community, <strong>{user.username}</strong>!</p>
                </div>
            </div>
        </div>
    );
}
