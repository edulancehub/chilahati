import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
    title: "Contact | Chilahati Archive",
    description:
        "Get in touch with স্বপ্নতরী ফাউন্ডেশন — a social and voluntary organisation from Chilahati, Domar, Nilphamari.",
};

export default function ContactPage() {
    return (
        <div className="main-content" style={{ padding: "60px 20px", minHeight: "100vh" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>

                {/* ── Foundation Info Card (left) ── */}
                <div
                    style={{
                        background: "white",
                        width: "100%",
                        padding: "40px 30px",
                        borderRadius: "30px",
                        textAlign: "center",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.1)",
                    }}
                >
                    {/* Logo */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://raw.githubusercontent.com/mdfhf2020-ui/About-us/main/l.png"
                        alt="স্বপ্নতরী ফাউন্ডেশন"
                        style={{ width: "110px", height: "110px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 18px", display: "block", border: "5px solid #3498db", boxShadow: "0 8px 20px rgba(52,152,219,0.2)" }}
                    />
                    <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#2c3e50", marginBottom: "6px" }}>স্বপ্নতরী ফাউন্ডেশন</h2>
                    <div style={{ background: "#eef6ff", color: "#2563eb", display: "inline-block", padding: "5px 16px", borderRadius: "30px", fontSize: "13px", marginBottom: "8px" }}>
                        <i className="fa-solid fa-shield-halved"></i> সম্পূর্ণ অরাজনৈতিক ও সেবামূলক
                    </div>
                    <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "6px" }}>
                        <i className="fa-solid fa-calendar-check" style={{ color: "#3498db" }}></i> প্রতিষ্ঠা: ২৭শে মার্চ, ২০২০
                    </p>
                    <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "20px" }}>
                        <i className="fa-solid fa-location-dot" style={{ color: "#3498db" }}></i> চিলাহাটি, ডোমার, নীলফামারী
                    </p>
                    <div style={{ width: "50px", height: "3px", background: "#3498db", margin: "0 auto 20px", borderRadius: "10px" }}></div>

                    {/* Contact details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px", textAlign: "left" }}>
                        {[
                            { icon: "fa-phone", text: "০১৭১৭-৬৭৫৫১২ (ফারহান)" },
                            { icon: "fa-phone", text: "০১৩৪১-২৮৫৬৭৬ (সাফিন)" },
                            { icon: "fa-phone", text: "০১৭৬৭-২০৭৯৯৯ (ফাহিম)" },
                            { icon: "fa-envelope", text: "sopnotory26@gmail.com" },
                        ].map((item) => (
                            <div key={item.text} style={{ background: "#f8fafd", padding: "10px 18px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px", color: "#334155" }}>
                                <i className={`fa-solid ${item.icon}`} style={{ color: "#3498db", width: "16px", flexShrink: 0 }}></i>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Social buttons */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                        <a href="https://www.facebook.com/sopnotorifoundationchilahati" target="_blank" rel="noopener noreferrer"
                            style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "white", textDecoration: "none", background: "#1877F2" }}>
                            <i className="fa-brands fa-facebook-f"></i>
                        </a>
                        <a href="https://wa.me/8801717675512" target="_blank" rel="noopener noreferrer"
                            style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "white", textDecoration: "none", background: "#25D366" }}>
                            <i className="fa-brands fa-whatsapp"></i>
                        </a>
                        <a href="mailto:sopnotory26@gmail.com"
                            style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", color: "white", textDecoration: "none", background: "#ea4335" }}>
                            <i className="fa-solid fa-envelope"></i>
                        </a>
                    </div>
                </div>

                {/* ── Contact Form (right) ── */}
                <ContactForm />
            </div>
        </div>
    );
}
