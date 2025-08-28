import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/app/providers";
import { MainNav } from "@/navigation";
import ClientOnly from "@/components/ClientOnly";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KALE Market",
  description: "KALE Market: Prediction markets with KALE on Stellar",
  icons: {
    icon: [
      { url: "/kalemarkets.png" },
      { url: "/kalemarkets.png", type: "image/png", sizes: "32x32" },
      { url: "/kalemarkets.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/kalemarkets.png", "/favicon.ico"],
    apple: ["/kalemarkets.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientOnly>
          <AppProviders>
            <MainNav />
            {children}
          </AppProviders>
        </ClientOnly>
      </body>
    </html>
  );
}
