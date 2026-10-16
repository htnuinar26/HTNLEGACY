import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIDU — Sistem Iuran Kas Bulanan",
  description:
    "SIDU: sistem pencatatan & verifikasi iuran kas bulanan untuk organisasi/komunitas (instance: HTN 26).",
  keywords: ["SIDU", "iuran", "kas", "organisasi", "HTN 26"],
  authors: [{ name: "SIDU Team" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} antialiased`}
        style={{
          fontFamily: "var(--font-jakarta), 'Inter', system-ui, sans-serif",
        }}
      >
        <ThemeProvider>
          {children}
          <Toaster />
          <SonnerToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
