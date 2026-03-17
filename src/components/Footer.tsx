import Link from "next/link";

export default function Footer() {
    return (
        <footer>
            <div className="footer-grid">
                {/* About */}
                <div>
                    <h4 className="footer-heading">স্বপ্নতরী ফাউন্ডেশন</h4>
                    <p className="footer-text">
                        এসএসসি ২০২০ ব্যাচের পরবর্তী সকল ব্যাচ কে নিয়ে গড়ে ওঠা একটি সামাজিক,
                        স্বেচ্ছাসেবী ও সম্পূর্ণ অরাজনৈতিক সংগঠন।
                    </p>
                    <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
                        {[
                            { href: "https://www.facebook.com/sopnotorifoundationchilahati", icon: "fa-brands fa-facebook-f", label: "Facebook" },
                            { href: "https://wa.me/8801717675512", icon: "fa-brands fa-whatsapp", label: "WhatsApp" },
                            { href: "mailto:sopnotory26@gmail.com", icon: "fa-solid fa-envelope", label: "Email" },
                        ].map((s) => (
                            <a
                                key={s.href}
                                href={s.href}
                                target={s.href.startsWith("mailto") ? undefined : "_blank"}
                                rel="noopener noreferrer"
                                aria-label={s.label}
                                className="footer-social-btn"
                            >
                                <i className={s.icon}></i>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="footer-heading">যোগাযোগ</h4>
                    <ul className="footer-contact-list">
                        <li>
                            <i className="fa-solid fa-location-dot footer-icon"></i>
                            চিলাহাটি, ডোমার, নীলফামারী, বাংলাদেশ।
                        </li>
                        <li>
                            <i className="fa-solid fa-phone footer-icon"></i>
                            <span>
                                ০১৭১৭-৬৭৫৫১২ (ফারহান)<br />
                                ০১৩৪১-২৮৫৬৭৬ (সাফিন)<br />
                                ০১৭৬৭-২০৭৯৯৯ (ফাহিম)<br />
                                ০১৫৮৬-০৩৩৭৩২ (তুহাদ)<br />
                                ০১৭৩০-২২১৯৪০ (জুবায়ের)
                            </span>
                        </li>
                        <li>
                            <i className="fa-solid fa-envelope footer-icon"></i>
                            <a href="mailto:sopnotory26@gmail.com" className="footer-link">sopnotory26@gmail.com</a>
                        </li>
                    </ul>
                </div>

                {/* Links */}
                <div>
                    <h4 className="footer-heading">দ্রুত লিঙ্ক</h4>
                    <ul className="footer-nav-list">
                        <li><Link href="/about" className="footer-link"><i className="fas fa-info-circle"></i> About Us</Link></li>
                        <li><Link href="/contribute" className="footer-link"><i className="fas fa-paper-plane"></i> Contribute</Link></li>
                        <li><Link href="/contact" className="footer-link"><i className="fas fa-envelope"></i> Contact</Link></li>
                        <li><Link href="/archive/history" className="footer-link"><i className="fas fa-history"></i> History</Link></li>
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/founding_group.png" alt="স্বপ্নতরী ফাউন্ডেশন" className="footer-logo" />
                <p>&copy; 2026 Chilahati.com &bull; স্বপ্নতরী ফাউন্ডেশন। সর্বস্বত্ব সংরক্ষিত।</p>
                <p className="maintained-by">
                    Maintained by{" "}
                    <a href="https://luminexlabs.io" target="_blank" rel="noopener noreferrer" className="maintained-link">
                        <i className="fa-solid fa-bolt"></i> luminexlabs.io
                    </a>
                </p>
            </div>
        </footer>
    );
}
