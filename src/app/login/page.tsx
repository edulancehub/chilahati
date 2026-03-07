"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import FlashMessage from "@/components/FlashMessage";
import { getFirebaseClientAuth, getGoogleProvider } from "@/lib/firebase/client";
import { exchangeFirebaseSession } from "@/lib/firebase/session";
import { sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refresh } = useAuth();

    const redirectTarget = searchParams.get("redirect") || "/";

    const finishLogin = async () => {
        await refresh();
        router.push(redirectTarget);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const auth = getFirebaseClientAuth();
            const credential = await signInWithEmailAndPassword(auth, email, password);

            if (!credential.user.emailVerified) {
                await sendEmailVerification(credential.user);
                await signOut(auth);
                setError("Please verify your email before logging in. A fresh verification email has been sent.");
            } else {
                await exchangeFirebaseSession(credential.user);
                setSuccess("Login successful! Redirecting...");
                await finishLogin();
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Network error. Please try again.";
            setError(message === "NOT_VERIFIED" ? "Please verify your email before logging in." : message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const credential = await signInWithPopup(getFirebaseClientAuth(), getGoogleProvider());
            await exchangeFirebaseSession(credential.user);
            setSuccess("Google login successful! Redirecting...");
            await finishLogin();
        } catch (err) {
            const code = (err as { code?: string }).code;
            if (code === "auth/unauthorized-domain") {
                setError("This domain is not authorised for Google sign-in. Please add it to Firebase Console → Authentication → Authorized Domains.");
            } else if (code === "auth/popup-blocked") {
                setError("Your browser blocked the sign-in popup. Please allow popups for this site and try again.");
            } else if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
                setError("Google sign-in was cancelled. Please try again.");
            } else {
                const message = err instanceof Error ? err.message : "Google sign-in failed";
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <FlashMessage type="error" message={error} />
                <FlashMessage type="success" message={success} />

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-control"
                            placeholder="Enter your email"
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
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div style={{ textAlign: "right", marginTop: "5px" }}>
                            <Link href="/forgot-password" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button type="submit" className="btn-block" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <button
                    type="button"
                    className="btn-block"
                    disabled={loading}
                    onClick={handleGoogleLogin}
                    style={{ marginTop: "0.85rem", background: "#ffffff", color: "#1f2937" }}
                >
                    <i className="fab fa-google"></i> Continue with Google
                </button>

                <div className="auth-footer">
                    Don&apos;t have an account?
                    <Link href="/register" className="auth-link">Register here</Link>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="auth-container"><div className="auth-card"><h2>Loading...</h2></div></div>}>
            <LoginForm />
        </Suspense>
    );
}
