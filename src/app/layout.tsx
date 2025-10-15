import type { Metadata } from "next";
import "./globals.minimal.css";

export const metadata: Metadata = {
  title: "Chat",
  description: "Minimal AI chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
