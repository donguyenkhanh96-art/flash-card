import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlashCard MVP",
  description: "Anki-like flashcard web app MVP",
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
