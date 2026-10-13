import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ViaLuxury · E-maildesigns",
  description: "Gallery van alle ViaLuxury e-mailontwerpen",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <header className="site-header">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo-vialuxury-horizontal.svg" alt="ViaLuxury" />
          </Link>
          <span>E-maildesigns</span>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
