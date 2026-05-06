import type { Metadata, Viewport } from "next";
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

const description = "Monitor your plant's health in real time.";

export const viewport: Viewport = {
  themeColor: "#F5A623",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Smart Flower Pot", template: "%s · Smart Flower Pot" },
  description,
  applicationName: "Smart Flower Pot",
  keywords: ["smart flower pot", "plant monitoring", "IoT", "humidity", "soil", "garden"],
  openGraph: {
    type: "website",
    siteName: "Smart Flower Pot",
    title: "Smart Flower Pot",
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Flower Pot",
    description,
  },
  appleWebApp: {
    capable: true,
    title: "Flower Pot",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
