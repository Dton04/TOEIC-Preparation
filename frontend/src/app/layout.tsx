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
  title: "TOEIC Master - Nền Tảng Luyện Thi TOEIC Thích Ứng & AI Tutor",
  description: "Luyện thi TOEIC 7 Parts chuẩn cấu trúc ETS, thi thử 200 câu áp lực cao, chuẩn đoán bẫy đề thi và giải thích bằng AI thông minh.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
