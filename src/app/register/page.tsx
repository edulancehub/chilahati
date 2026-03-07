"use client";

import { useState } from "react";
import Link from "next/link";
import FlashMessage from "@/components/FlashMessage";
import { useRouter } from "next/navigation";
import { getFirebaseClientAuth, getGoogleProvider } from "@/lib/firebase/client";
import { exchangeFirebaseSession } from "@/lib/firebase/session";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, signOut, updateProfile } from "firebase/auth";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordMismatch, setPasswordMismatch] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setPasswordMismatch(true);
            return;
        }

        setLoading(true);
        try {
            const auth = getFirebaseClientAuth();
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(credential.user, { displayName: username.trim() });
            await sendEmailVerification(credential.user);
            await signOut(auth);
            setSuccess("Account created. Please verify your email from Firebase before logging in.");
            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Registration failed";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const credential = await signInWithPopup(getFirebaseClientAuth(), getGoogleProvider());
            await exchangeFirebaseSession(credential.user);
            router.push("/");
        } catch (err) {
            const code = (err as { code?: string }).code;
            if (code === "auth/unauthorized-domain") {
                setError("This domain is not authorised for Google sign-in. Please add it to Firebase Console → Authentication → Authorized Domains.");
            } else if (code === "auth/popup-blocked") {
                setError("Your browser blocked the sign-in popup. Please allow popups for this site and try again.");
            } else if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
                setError("Google sign-up was cancelled. Please try again.");
            } else {
                const message = err instanceof Error ? err.message : "Google sign-up failed";
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Join the Community</h2>
                <FlashMessage type="error" message={error} />
                <FlashMessage type="success" message={success} />

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="Min. 8 characters"
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm_password">Confirm Password</label>
                        <input
                            type="password"
                            id="confirm_password"
                            className="form-control"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setPasswordMismatch(false);
                            }}
                            style={passwordMismatch ? { borderColor: "#ff6b6b" } : {}}
                            required
                        />
                        {passwordMismatch && (
                            <small style={{ color: "#ff6b6b", display: "block", marginTop: "5px" }}>
                                Passwords do not match!
                            </small>
                        )}
                    </div>

                    <button type="submit" className="btn-block" disabled={loading}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <button
                    type="button"
                    className="btn-block"
                    disabled={loading}
                    onClick={handleGoogleRegister}
                    style={{ marginTop: "0.85rem", background: "#ffffff", color: "#1f2937" }}
                >
                    <i className="fab fa-google"></i> Continue with Google
                </button>

                <div className="auth-footer">
                    Already have an account?
                    <Link href="/login" className="auth-link">Login here</Link>
                </div>
            </div>
        </div>
    );
}
