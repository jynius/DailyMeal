import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DailyMeal - 나만의 식단 기록",
  description: "매일의 식사를 기록하고 추억을 남기세요",
  keywords: ["식단", "음식", "기록", "맛집", "리뷰"],
  openGraph: {
    title: "DailyMeal - 나만의 식단 기록",
    description: "매일의 식사를 기록하고 추억을 남기세요",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
