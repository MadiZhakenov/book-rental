"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/api";
import { User } from "lucide-react";

export function Navbar() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        setIsAuthenticated(!!getAuthToken());
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-stone-200/40 bg-[#FAFAF9]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FAFAF9]/60 font-manrope">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex gap-6 md:gap-10">
                    <Link href="/kk" className="flex items-center space-x-2">
                        <span className="text-xl font-bold tracking-tight">BookRental</span>
                    </Link>
                    <nav className="hidden gap-6 md:flex">
                        <Link
                            href="/catalog"
                            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            Каталог
                        </Link>
                        <Link
                            href="/map"
                            className="flex items-center text-sm font-medium text-stone-500 transition-colors hover:text-orange-600"
                        >
                            Карта
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/ru" className="text-sm text-stone-500 hover:text-orange-600">
                        RU
                    </Link>
                    {isAuthenticated ? (
                        <Button size="sm" asChild className="bg-orange-600 hover:bg-orange-700 text-white">
                            <Link href="/kk/profile">
                                <User className="mr-2 h-4 w-4" />
                                Профиль
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" asChild className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                                <Link href="/kk/auth/login">Кіру</Link>
                            </Button>
                            <Button size="sm" asChild className="bg-orange-600 hover:bg-orange-700 text-white">
                                <Link href="/kk/auth/register">Бастау</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
