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
        url: "https://gamerate.vercel.app/og-image.png?v=2",
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
    images: ["https://gamerate.vercel.app/og-image.png?v=2"],
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
        {/* Splash Screen */}
        <div
          id="splash"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: '#0f0a19',
            transition: 'opacity 0.3s ease-out',
          }}
        >
          <img
            src="/GameRate.png"
            alt="GameRate"
            width={72}
            height={72}
            style={{ width: '72px', height: '72px' }}
          />
          <span
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #8b5cf6, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            GameRate
          </span>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                setTimeout(function() {
                  var splash = document.getElementById('splash');
                  if (splash) {
                    splash.style.opacity = '0';
                    setTimeout(function() {
                      splash.style.display = 'none';
                    }, 300);
                  }
                }, 1000);
              });
            `,
          }}
        />
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
