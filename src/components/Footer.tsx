export default function Footer() {
    return (
        <footer>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
                <p>&copy; 2026 Chilahati.com. All rights reserved.</p>
                <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
                    Powered by{" "}
                    <a href="/about" style={{ color: "inherit", fontWeight: 600 }}>স্বপ্নতরী ফাউন্ডেশন</a>
                </p>
                <div style={{ textAlign: "center" }}>
                    <p className="footer-credit">
                        Maintained by{" "}
                        <a href="https://luminexlabs.io" target="_blank" rel="noopener noreferrer">luminexlabs.io</a>
                        {" "}— Build your app and website with us
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/founding_group.png" alt="স্বপ্নতরী ফাউন্ডেশন" className="footer-logo" />
                </div>
            </div>
        </footer>
    );
}
