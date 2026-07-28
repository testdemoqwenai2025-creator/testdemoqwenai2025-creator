import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Autonomous Compliance — Observability Dashboard",
  description: "Full-stack observability infrastructure for Autonomous Compliance with distributed tracing, compliance metrics, audit logs, and intelligent alerting across SOC2, GDPR, HIPAA, ISO27001, PCI-DSS, NIST-CSF, and CIS frameworks.",
  keywords: ["autonomous compliance", "observability", "monitoring", "tracing", "compliance", "SOC2", "GDPR", "HIPAA", "ISO27001", "dashboard", "Next.js"],
  authors: [{ name: "Z.ai Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Autonomous Compliance — Observability Dashboard",
    description: "Observability infrastructure for autonomous compliance with distributed tracing, compliance metrics, audit logs & alerting",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Autonomous Compliance — Observability Dashboard",
    description: "Observability infrastructure for autonomous compliance with distributed tracing, compliance metrics, audit logs & alerting",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
