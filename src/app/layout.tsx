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
  manifest: "/manifest.json",
  icons: {
    icon: "/GameRate.png",
    apple: "/GameRate.png",
  },
  openGraph: {
    title: "GameRate - Track, Rate & Discover Games",
    description: "Your personal video game diary. Rate games, build your Top 5, create lists, and see what friends are playing.",
    url: "https://gamerate.vercel.app",
    siteName: "GameRate",
    type: "website",
    images: [
      {
        url: "https://gamerate.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "GameRate - Track, Rate & Discover Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GameRate - Track, Rate & Discover Games",
    description: "Your personal video game diary. Rate games, build your Top 5, create lists, and see what friends are playing.",
    images: ["https://gamerate.vercel.app/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GameRate",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: 430,
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#8b5cf6" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-20 lg:pb-0`}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
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
