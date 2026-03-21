import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "react-quill-new/dist/quill.snow.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.chilahati.com"),
  title: {
    default: "Chilahati.com | Community Archive",
    template: "%s | Chilahati.com",
  },
  description: "Chilahati.com preserves the history, people, institutions, and stories of Chilahati.",
  keywords: [
    "chilahati",
    "chilahti",
    "chilahati archive",
    "chilahti-archive",
    "chilahati.com",
    "nilphamari history",
  ],
  applicationName: "Chilahati.com",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Chilahati.com | Community Archive",
    description: "Preserving the stories, heritage, and living memory of Chilahati.",
    url: "/",
    siteName: "Chilahati.com",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className={poppins.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
