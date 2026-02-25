"use client";

interface FlashMessageProps {
    type: "success" | "error";
    message: string;
}

export default function FlashMessage({ type, message }: FlashMessageProps) {
    if (!message) return null;

    if (type === "success") {
        return (
            <div style={{
                background: "rgba(46, 204, 113, 0.2)",
                border: "1px solid #2ecc71",
                color: "#2ecc71",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "15px",
                textAlign: "center",
            }}>
                <i className="fas fa-check-circle"></i> {message}
            </div>
        );
    }

    return (
        <div style={{
            background: "rgba(255, 107, 107, 0.2)",
            border: "1px solid #ff6b6b",
            color: "#ff6b6b",
            padding: "10px",
            borderRadius: "8px",
            marginBottom: "15px",
            textAlign: "center",
        }}>
            <i className="fas fa-exclamation-circle"></i> {message}
        </div>
    );
}
