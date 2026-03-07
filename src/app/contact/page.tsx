import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
    title: "Contact | Chilahati Archive",
    description:
        "Get in touch with the Chilahati Archive team — Farhan Hasin Fahim, ETE · RUET, Chilahati, Domar, Nilphamari.",
};

export default function ContactPage() {
    return (
        <div className="main-content" style={{ padding: "60px 20px", minHeight: "100vh" }}>
            <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>

                {/* ── Profile Card (left) ── */}
                <div
                    style={{
                        background: "white",
                        maxWidth: "440px",
                        width: "100%",
                        padding: "40px 30px",
                        borderRadius: "40px",
                        textAlign: "center",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.1)",
                    }}
                >
                    <div
                        style={{
                            width: "150px",
                            height: "150px",
                            borderRadius: "50%",
                            background: "#e8f4fd",
                            margin: "0 auto 20px",
                            border: "6px solid #3498db",
                            boxShadow: "0 10px 25px rgba(52,152,219,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <i className="fas fa-user" style={{ fontSize: "4rem", color: "#3498db", opacity: 0.5 }}></i>
                    </div>

                    <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
                        Farhan Hasin Fahim
                    </h1>

                    <div
                        style={{
                            background: "#eef6ff",
                            color: "#2563eb",
                            display: "inline-block",
                            padding: "6px 18px",
                            borderRadius: "30px",
                            fontSize: "14px",
                            marginBottom: "12px",
                        }}
                    >
                        <i className="fa-regular fa-circle-check"></i> ETE · RUET
                    </div>

                    <div style={{ color: "#64748b", fontSize: "14px", marginBottom: "20px" }}>
                        <i className="fa-solid fa-location-dot"></i> Chilahati, Domar, Nilphamari
                    </div>

                    <div style={{ width: "60px", height: "4px", background: "#2563eb", margin: "0 auto 25px", borderRadius: "10px" }}></div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
                        {[
                            { icon: "fa-microchip", text: "Student of <b>ETE, RUET</b>" },
                            { icon: "fa-building-columns", text: "<b>Rangpur Govt College</b>" },
                            { icon: "fa-school", text: "<b>Chilahati Merchants High School</b>" },
                        ].map((info) => (
                            <div
                                key={info.icon}
                                style={{
                                    background: "#f8fafd",
                                    padding: "12px 20px",
                                    borderRadius: "30px",
                                    border: "1px solid #e2e8f0",
                                    fontSize: "15px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "10px",
                                    color: "#334155",
                                }}
                            >
                                <i className={`fa-solid ${info.icon}`} style={{ color: "#2563eb" }}></i>
                                <span dangerouslySetInnerHTML={{ __html: info.text }} />
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginBottom: "28px" }}>
                        <a
                            href="https://wa.me/8801767207999"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ width: "52px", height: "52px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "white", textDecoration: "none", background: "#25D366" }}
                        >
                            <i className="fa-brands fa-whatsapp"></i>
                        </a>
                        <a
                            href="https://www.facebook.com/fhf2022/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ width: "52px", height: "52px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "white", textDecoration: "none", background: "#1877F2" }}
                        >
                            <i className="fa-brands fa-facebook-f"></i>
                        </a>
                        <a
                            href="mailto:sopnotory26@gmail.com"
                            style={{ width: "52px", height: "52px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "white", textDecoration: "none", background: "#ea4335" }}
                        >
                            <i className="fa-solid fa-envelope"></i>
                        </a>
                    </div>

                    <div
                        style={{
                            borderTop: "1px dashed #cbd5e1",
                            paddingTop: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            color: "#94a3b8",
                            fontSize: "12px",
                        }}
                    >
                        <i className="fa-solid fa-box-archive" style={{ color: "#2563eb", flexShrink: 0 }}></i>
                        <span>Collecting the past, connecting the future.</span>
                        <i className="fa-solid fa-book-open" style={{ color: "#2563eb", flexShrink: 0 }}></i>
                    </div>
                </div>

                {/* ── Contact Form (right) ── */}
                <ContactForm />
            </div>
        </div>
    );
}
