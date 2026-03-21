import { Inter, Manrope } from "next/font/google";

import { ChatProvider } from "../components/chat-provider.jsx";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata = {
  title: "ETHEREAL WHISPER",
  description: "零数据库、零日志、零持久化的匿名聊天应用。"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body
        className={`${manrope.variable} ${inter.variable} bg-background font-body text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container`}
      >
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
