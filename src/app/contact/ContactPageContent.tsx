"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ContactForm from "./ContactForm";

export default function ContactPageContent() {
    const { user } = useAuth();

    if (user?.role === "admin") {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2><i className="fas fa-envelope"></i> Contact Messages</h2>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.75rem" }}>
                        আপনি এডমিন। সব Contact Form মেসেজ দেখতে Admin Panel-এ যান।
                    </p>
                    <Link href="/admin/content-management" className="btn-block" style={{ marginTop: "1.25rem" }}>
                        <i className="fas fa-shield-alt"></i> View All Messages
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            <ContactForm />
        </div>
    );
}
