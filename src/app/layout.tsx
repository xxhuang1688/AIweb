import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyncCraft",
  description: "3分でホームページ制作プランと標準JSONを作成します。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
