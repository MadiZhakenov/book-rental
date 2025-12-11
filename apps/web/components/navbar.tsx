"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';

export function Navbar() {
    const t = useTranslations('nav');

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex gap-6 md:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold tracking-tight">{t('logo')}</span>
                    </Link>
                    <nav className="hidden gap-6 md:flex">
                        <Link
                            href="/catalog"
                            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t('catalog')}
                        </Link>
                        <Link
                            href="/map"
                            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t('map')}
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/login">{t('login')}</Link>
                    </Button>
                    <Button size="sm" asChild>
                        <Link href="/register">{t('getStarted')}</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}
