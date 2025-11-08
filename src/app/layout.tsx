import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Chat",
  description: "Minimal AI chat",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const nonce = headerList.get("x-csp-nonce") ?? undefined;

  return (
    <html lang="en" suppressHydrationWarning={true} data-csp-nonce={nonce}>
      <head>{nonce ? <meta name="csp-nonce" content={nonce} /> : null}</head>
      <body data-csp-nonce={nonce}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
