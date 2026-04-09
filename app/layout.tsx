import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Street Music Live",
  description: "QR voting page for street musician"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
