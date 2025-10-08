import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PWAInstaller } from "@/components/pwa-installer";
import { RealTimeNotifications } from "@/components/realtime-notifications";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DailyMeal - 식단 기록 앱",
  description: "매일의 맛있는 순간을 기록하고 공유하는 소셜 식단 플랫폼",
  keywords: ["식단", "음식", "기록", "맛집", "리뷰", "소셜", "공유"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DailyMeal",
  },
  openGraph: {
    title: "DailyMeal - 식단 기록 앱",
    description: "매일의 맛있는 순간을 기록하고 공유하는 소셜 식단 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased overflow-x-hidden`}>
        <Providers>
          <PWAInstaller />
          <RealTimeNotifications />
          <div className="min-h-screen bg-gray-50 pb-safe-bottom">
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-lg">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
