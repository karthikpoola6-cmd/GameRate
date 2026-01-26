import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
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
  title: "GameRate - Track, Rate & Discover Games",
  description: "Your personal video game diary. Track games you've played, rate them, create lists, and discover new favorites.",
};

export const viewport = {
  width: 430,
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-20 lg:pb-0`}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#241832',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#f5f5f5',
            },
          }}
        />
      </body>
    </html>
  );
}
