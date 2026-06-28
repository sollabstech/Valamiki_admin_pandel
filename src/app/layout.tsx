import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VALAMIKI Admin Panel",
  description: "Admin dashboard for VALAMIKI ecommerce platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-[#f8f9ff] text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
