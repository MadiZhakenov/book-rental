import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/navbar";

const manrope = Manrope({
    subsets: ["latin", "cyrillic"],
    variable: "--font-manrope",
});

export const metadata: Metadata = {
    title: "Book Rental Platform",
    description: "Peer-to-peer book rental marketplace",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru" suppressHydrationWarning>
            <body className={`${manrope.className} bg-[#FAFAF9] text-stone-900 antialiased`}>
                {children}
            </body>
        </html>
    );
}
