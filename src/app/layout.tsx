import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PuzzleMe — Piece Your Memories Together",
    template: "%s | PuzzleMe",
  },
  description:
    "A photo puzzle app for seniors. Family uploads a memory, residents piece it back together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#FAF8F5] text-stone-900`}>
        {children}
      </body>
    </html>
  );
}
