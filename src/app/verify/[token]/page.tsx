"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

export default function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch(`/api/auth/verify/${token}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setStatus("error");
                    setMessage(data.error);
                } else {
                    setStatus("success");
                    setMessage(data.message || "Email verified successfully!");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage("Network error. Please try again.");
            });
    }, [token]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                {status === "loading" && (
                    <>
                        <h2>Verifying...</h2>
                        <p style={{ color: "rgba(255,255,255,0.7)" }}>Please wait while we verify your email.</p>
                    </>
                )}
                {status === "success" && (
                    <>
                        <h2><i className="fas fa-check-circle" style={{ color: "#2ecc71" }}></i> Verified!</h2>
                        <p style={{ color: "rgba(255,255,255,0.7)" }}>{message}</p>
                        <Link href="/login" className="btn-block" style={{ marginTop: "1.5rem" }}>
                            Go to Login
                        </Link>
                    </>
                )}
                {status === "error" && (
                    <>
                        <h2><i className="fas fa-exclamation-circle" style={{ color: "#ff6b6b" }}></i> Error</h2>
                        <p style={{ color: "rgba(255,255,255,0.7)" }}>{message}</p>
                        <Link href="/register" className="btn-block" style={{ marginTop: "1.5rem" }}>
                            Try Again
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
