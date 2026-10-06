import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iepverify.com"),

  title: "IEP Verify | Texas IEP Documentation Review",

  description:
    "Review IEP documentation against available evidence, identify material gaps, and evaluate alignment across key IEP sections.",

  alternates: {
    canonical: "https://iepverify.com",
  },

  openGraph: {
    title: "IEP Verify | Independent IEP Documentation Review",
    description:
      "Evidence-based review, documentation alignment, and clearer next steps.",
    url: "https://iepverify.com",
    siteName: "IEP Verify",
    type: "website",
    images: [
      {
        url: "/iep-verify-og.png",
        alt: "IEP Verify independent IEP documentation review",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "IEP Verify | Independent IEP Documentation Review",
    description:
      "Evidence-based review, documentation alignment, and clearer next steps.",
    images: ["/iep-verify-og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}