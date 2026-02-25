import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export function getBaseUrl(): string {
    if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, "");
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
}

export async function sendMail(to: string, subject: string, html: string, text?: string) {
    return transporter.sendMail({
        from: `"Chilahati Archive Admin" <${process.env.EMAIL_USER}>`,
        to,
        replyTo: process.env.EMAIL_USER,
        priority: "high",
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
    });
}

export default transporter;
