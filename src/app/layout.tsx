import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VOTE TABLE;",
  description: "Vote on databases presented at FLIP TABLE;",
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
