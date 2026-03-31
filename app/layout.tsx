import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OMG 奇聞地圖 — API",
  description: "Odd Map Gossip - NTU Web Team 16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
