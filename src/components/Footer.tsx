export default function Footer() {
    return (
        <footer>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                <p>&copy; 2025 Chilahati Archive. All rights reserved.</p>
                <div style={{ textAlign: "center" }}>
                    <p className="footer-credit">
                        Brought to you by the Shopnotory Foundation in partnership with the community of Chilahati.
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/photos/founding_group.png" alt="Founding Group Logo" className="footer-logo" />
                </div>
            </div>
        </footer>
    );
}
