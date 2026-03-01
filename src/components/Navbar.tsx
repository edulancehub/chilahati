"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [catOpen, setCatOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileCatOpen, setMobileCatOpen] = useState(false);
    const catRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);
    const [searchQ, setSearchQ] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "dark") {
            document.body.classList.add("dark-mode");
            setTheme("dark");
        }
    }, []);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
            if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
        }
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    function toggleTheme() {
        if (theme === "light") {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
            setTheme("dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
            setTheme("light");
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (searchQ.trim()) {
            setMobileOpen(false);
            window.location.href = `/search?q=${encodeURIComponent(searchQ)}`;
        }
    }

    function closeMobile() {
        setMobileOpen(false);
        setMobileCatOpen(false);
    }

    const isStaff = user && (user.role === "admin" || user.role === "supervisor");

    const categoryLinks = [
        { href: "/archive/history", icon: "fas fa-history", label: "History" },
        { href: "/archive/culture", icon: "fas fa-palette", label: "Culture" },
        { href: "/archive/institution", icon: "fas fa-university", label: "Institutions" },
        { href: "/archive/notable-people", icon: "fas fa-user-tie", label: "Notable People" },
        { href: "/archive/freedom-fighters", icon: "fas fa-fist-raised", label: "Freedom Fighters" },
        { href: "/archive/meritorious-student", icon: "fas fa-user-graduate", label: "Meritorious Students" },
        { href: "/archive/occupation", icon: "fas fa-tools", label: "Occupation" },
        { href: "/archive/hidden-talent", icon: "fas fa-star", label: "Hidden Talent" },
        { href: "/archive/heartbreaking-stories", icon: "fas fa-heart-broken", label: "Breaking Stories" },
        { href: "/archive/tourist-spots", icon: "fas fa-camera-retro", label: "Tourist Spots" },
        { href: "/archive/transport", icon: "fas fa-train", label: "Transport" },
        { href: "/archive/emergency-services", icon: "fas fa-hand-holding-medical", label: "Emergency" },
        { href: "/archive/social-works", icon: "fas fa-hands-helping", label: "Social Work" },
    ];

    return (
        <>
            <nav className="navbar">
                <Link href="/" className="logo">
                    <i className="fas fa-train"></i> Chilahati
                </Link>

                {/* ===== DESKTOP NAV ===== */}
                <div className="nav-links">
                    <Link href="/" className="nav-item">Home</Link>

                    <div className={`dropdown ${catOpen ? "active" : ""}`} ref={catRef}>
                        <button className="nav-item dropdown-toggle" onClick={() => setCatOpen(!catOpen)}>
                            Categories <i className="fas fa-chevron-down" style={{ fontSize: "0.8em", marginLeft: "5px" }}></i>
                        </button>
                        <div className="dropdown-menu">
                            {categoryLinks.map((c) => (
                                <Link key={c.href} href={c.href} className="dropdown-item"><i className={c.icon}></i> {c.label}</Link>
                            ))}
                        </div>
                    </div>

                    <Link href="/contribute" className="nav-item">Contribute</Link>
                    <Link href="#" className="nav-item">Contact</Link>
                    <Link href="#" className="nav-item">About Us</Link>
                </div>

                <div className="nav-actions">
                    <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Dark Mode">
                        <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
                    </button>

                    <div className="search-box">
                        <form onSubmit={handleSearch} style={{ display: "flex" }}>
                            <input
                                type="text"
                                className="search-txt"
                                placeholder="Search..."
                                value={searchQ}
                                onChange={(e) => setSearchQ(e.target.value)}
                            />
                            <button type="submit" className="search-btn-icon"><i className="fas fa-search"></i></button>
                        </form>
                    </div>

                    {!user ? (
                        <>
                            <Link href="/login" className="login-btn">Login</Link>
                            <Link href="/register" className="register-btn">Register</Link>
                        </>
                    ) : (
                        <>
                            {isStaff && (
                                <Link href="/admin/add" className="nav-item" style={{ color: "#ffda79" }}>
                                    <i className="fas fa-plus-circle"></i> Add Content
                                </Link>
                            )}

                            {isStaff ? (
                                <div className={`dropdown ${userOpen ? "active" : ""}`} ref={userRef}>
                                    <button className="nav-item dropdown-toggle" onClick={() => setUserOpen(!userOpen)}>
                                        Hi, {user.username} <i className="fas fa-chevron-down" style={{ fontSize: "0.8em", marginLeft: "5px" }}></i>
                                    </button>
                                    <div className="dropdown-menu">
                                        <Link href="/profile" className="dropdown-item"><i className="fas fa-user"></i> Profile</Link>
                                        <Link href="/admin/content-management" className="dropdown-item"><i className="fas fa-file-alt"></i> Content Management</Link>
                                        {user.role === "admin" && (
                                            <Link href="/admin-panel" className="dropdown-item"><i className="fas fa-user-shield"></i> Admin Panel</Link>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <Link href="/profile" className="nav-item">Hi, {user.username}</Link>
                            )}
                            <button onClick={logout} className="login-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "30px", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                                Logout
                            </button>
                        </>
                    )}
                </div>

                {/* ===== HAMBURGER BUTTON (mobile only) ===== */}
                <button
                    className="hamburger-btn"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle navigation"
                >
                    <i className={`fas ${mobileOpen ? "fa-times" : "fa-bars"}`}></i>
                </button>
            </nav>

            {/* ===== MOBILE DRAWER OVERLAY ===== */}
            {mobileOpen && <div className="mobile-overlay" onClick={closeMobile}></div>}

            {/* ===== MOBILE DRAWER ===== */}
            <aside className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
                {/* Mobile search */}
                <form onSubmit={handleSearch} className="mobile-search">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQ}
                        onChange={(e) => setSearchQ(e.target.value)}
                    />
                    <button type="submit"><i className="fas fa-search"></i></button>
                </form>

                <div className="mobile-nav-links">
                    <Link href="/" className="mobile-nav-item" onClick={closeMobile}>
                        <i className="fas fa-home"></i> Home
                    </Link>

                    {/* Collapsible categories */}
                    <button className="mobile-nav-item mobile-cat-toggle" onClick={() => setMobileCatOpen(!mobileCatOpen)}>
                        <span><i className="fas fa-th-large"></i> Categories</span>
                        <i className={`fas fa-chevron-down mobile-chevron ${mobileCatOpen ? "rotated" : ""}`}></i>
                    </button>
                    {mobileCatOpen && (
                        <div className="mobile-cat-list">
                            {categoryLinks.map((c) => (
                                <Link key={c.href} href={c.href} className="mobile-cat-item" onClick={closeMobile}>
                                    <i className={c.icon}></i> {c.label}
                                </Link>
                            ))}
                        </div>
                    )}

                    <Link href="/contribute" className="mobile-nav-item" onClick={closeMobile}>
                        <i className="fas fa-paper-plane"></i> Contribute
                    </Link>
                    <Link href="#" className="mobile-nav-item" onClick={closeMobile}>
                        <i className="fas fa-envelope"></i> Contact
                    </Link>
                    <Link href="#" className="mobile-nav-item" onClick={closeMobile}>
                        <i className="fas fa-info-circle"></i> About Us
                    </Link>

                    {isStaff && (
                        <Link href="/admin/add" className="mobile-nav-item" onClick={closeMobile} style={{ color: "#ffda79" }}>
                            <i className="fas fa-plus-circle"></i> Add Content
                        </Link>
                    )}
                    {isStaff && (
                        <Link href="/admin/content-management" className="mobile-nav-item" onClick={closeMobile}>
                            <i className="fas fa-file-alt"></i> Content Management
                        </Link>
                    )}
                </div>

                {/* Mobile auth section */}
                <div className="mobile-auth">
                    {!user ? (
                        <>
                            <Link href="/login" className="mobile-auth-btn login" onClick={closeMobile}>Login</Link>
                            <Link href="/register" className="mobile-auth-btn register" onClick={closeMobile}>Register</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/profile" className="mobile-nav-item" onClick={closeMobile}>
                                <i className="fas fa-user"></i> Hi, {user.username}
                            </Link>
                            <button onClick={() => { closeMobile(); logout(); }} className="mobile-auth-btn logout">
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </button>
                        </>
                    )}
                </div>

                {/* Theme toggle */}
                <button className="mobile-theme-btn" onClick={toggleTheme}>
                    <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
                    {theme === "dark" ? " Light Mode" : " Dark Mode"}
                </button>
            </aside>
        </>
    );
}
