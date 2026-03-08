import type { Metadata } from "next";
import ContactPageContent from "./ContactPageContent";

export const metadata: Metadata = {
    title: "Contact | Chilahati Archive",
    description:
        "Get in touch with ????????? ????????? — a social and voluntary organisation from Chilahati, Domar, Nilphamari.",
};

export default function ContactPage() {
    return (
        <div className="main-content" style={{ padding: "60px 20px", minHeight: "100vh" }}>
            <ContactPageContent />
        </div>
    );
}
