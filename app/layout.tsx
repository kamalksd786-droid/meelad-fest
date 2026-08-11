import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MUNAFASA 2026",
  description: "Global Public School - MUNAFASA Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  );
}