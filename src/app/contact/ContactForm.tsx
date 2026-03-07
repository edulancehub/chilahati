"use client";

import { useState } from "react";

export default function ContactForm() {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setErrorMsg("");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setFormData({ name: "", email: "", message: "" });
            } else {
                setStatus("error");
                setErrorMsg(data.error || "Failed to send message");
            }
        } catch {
            setStatus("error");
            setErrorMsg("Network error. Please try again.");
        }
    }

    return (
        <div
            style={{
                background: "white",
                padding: "40px",
                borderRadius: "24px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
            }}
        >
            <h2 style={{ color: "#0f172a", marginBottom: "8px", fontSize: "1.8rem" }}>
                <i className="fas fa-paper-plane" style={{ color: "#2563eb" }}></i> Send a Message
            </h2>
            <p style={{ color: "#64748b", marginBottom: "30px", fontSize: "0.95rem" }}>
                Have a question, suggestion or contribution? We&apos;d love to hear from you.
            </p>

            {status === "success" && (
                <div
                    style={{
                        background: "#ecfdf5",
                        color: "#065f46",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        marginBottom: "20px",
                        border: "1px solid #a7f3d0",
                    }}
                >
                    <i className="fas fa-check-circle"></i> Message sent successfully! We&apos;ll get back to you soon.
                </div>
            )}

            {status === "error" && (
                <div
                    style={{
                        background: "#fef2f2",
                        color: "#991b1b",
                        padding: "14px 18px",
                        borderRadius: "12px",
                        marginBottom: "20px",
                        border: "1px solid #fecaca",
                    }}
                >
                    <i className="fas fa-exclamation-circle"></i> {errorMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "6px", fontSize: "0.9rem" }}>
                        Your Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        placeholder="e.g. Rahman Khan"
                        required
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            fontSize: "15px",
                            outline: "none",
                            background: "#f8fafd",
                            boxSizing: "border-box",
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "6px", fontSize: "0.9rem" }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        placeholder="your@email.com"
                        required
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            fontSize: "15px",
                            outline: "none",
                            background: "#f8fafd",
                            boxSizing: "border-box",
                        }}
                    />
                </div>

                <div>
                    <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "6px", fontSize: "0.9rem" }}>
                        Message
                    </label>
                    <textarea
                        value={formData.message}
                        onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                        placeholder="Write your message here…"
                        required
                        rows={5}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            fontSize: "15px",
                            outline: "none",
                            background: "#f8fafd",
                            resize: "vertical",
                            boxSizing: "border-box",
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === "loading"}
                    style={{
                        padding: "14px 28px",
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        fontWeight: 700,
                        fontSize: "16px",
                        cursor: status === "loading" ? "not-allowed" : "pointer",
                        opacity: status === "loading" ? 0.7 : 1,
                        transition: "opacity 0.2s",
                    }}
                >
                    {status === "loading" ? (
                        <><i className="fas fa-spinner fa-spin"></i> Sending…</>
                    ) : (
                        <><i className="fas fa-paper-plane"></i> Send Message</>
                    )}
                </button>
            </form>
        </div>
    );
}
