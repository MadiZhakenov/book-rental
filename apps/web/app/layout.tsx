import type { Metadata } from "next";
import "./globals.css";

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
            <body className="bg-[#FAFAF9] text-stone-900 antialiased">
                {children}
            </body>
        </html>
    );
}
