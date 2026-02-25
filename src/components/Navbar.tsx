"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [catOpen, setCatOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);
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
        if (searchQ.trim()) window.location.href = `/search?q=${encodeURIComponent(searchQ)}`;
    }

    const isStaff = user && (user.role === "admin" || user.role === "supervisor");

    return (
        <nav className="navbar">
            <Link href="/" className="logo">
                <i className="fas fa-train"></i> Chilahati
            </Link>

            <div className="nav-links">
                <Link href="/" className="nav-item">Home</Link>

                {/* Categories Dropdown */}
                <div className={`dropdown ${catOpen ? "active" : ""}`} ref={catRef}>
                    <button className="nav-item dropdown-toggle" onClick={() => setCatOpen(!catOpen)}>
                        Categories <i className="fas fa-chevron-down" style={{ fontSize: "0.8em", marginLeft: "5px" }}></i>
                    </button>
                    <div className="dropdown-menu">
                        <Link href="/archive/history" className="dropdown-item"><i className="fas fa-history"></i> History</Link>
                        <Link href="/archive/culture" className="dropdown-item"><i className="fas fa-palette"></i> Culture</Link>
                        <Link href="/archive/institution" className="dropdown-item"><i className="fas fa-university"></i> Institutions</Link>
                        <Link href="/archive/notable-people" className="dropdown-item"><i className="fas fa-user-tie"></i> Notable People</Link>
                        <Link href="/archive/freedom-fighters" className="dropdown-item"><i className="fas fa-fist-raised"></i> Freedom Fighters</Link>
                        <Link href="/archive/meritorious-student" className="dropdown-item"><i className="fas fa-user-graduate"></i> Meritorious Students</Link>
                        <Link href="/archive/occupation" className="dropdown-item"><i className="fas fa-tools"></i> Occupation</Link>
                        <Link href="/archive/hidden-talent" className="dropdown-item"><i className="fas fa-star"></i> Hidden Talent</Link>
                        <Link href="/archive/heartbreaking-stories" className="dropdown-item"><i className="fas fa-heart-broken"></i> Breaking Stories</Link>
                        <Link href="/archive/tourist-spots" className="dropdown-item"><i className="fas fa-camera-retro"></i> Tourist Spots</Link>
                        <Link href="/archive/transport" className="dropdown-item"><i className="fas fa-train"></i> Transport</Link>
                        <Link href="/archive/emergency-services" className="dropdown-item"><i className="fas fa-hand-holding-medical"></i> Emergency</Link>
                        <Link href="/archive/social-works" className="dropdown-item"><i className="fas fa-hands-helping"></i> Social Work</Link>
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
        </nav>
    );
}
