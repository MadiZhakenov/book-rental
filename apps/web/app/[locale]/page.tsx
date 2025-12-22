import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Search, Sparkles, Star } from "lucide-react";
import { getTranslations } from 'next-intl/server';
import { getFeaturedBooks, PublicBook } from "@/lib/api";
import { BookCard } from "@/components/BookCard";

export function generateStaticParams() {
    return [{ locale: 'ru' }, { locale: 'kk' }];
}

// Принудительно динамический рендеринг для получения свежих данных
export const dynamic = 'force-dynamic';
export const revalidate = 60;

async function getFeaturedBooksData() {
    // Используем абсолютный URL для серверных компонентов
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const url = `${API_URL}/books/featured`;
    
    try {
        console.log('[SERVER] Fetching featured books from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            next: { revalidate: 60 },
        });
        
        console.log('[SERVER] Response status:', response.status);
        
        if (!response.ok) {
            const text = await response.text();
            console.error('[SERVER] API response not OK:', response.status, response.statusText, text);
            return { popular: [], newArrivals: [] };
        }
        
        const data = await response.json();
        console.log('[SERVER] Raw data received:', JSON.stringify(data).substring(0, 200));
        
        // Проверяем структуру данных
        if (!data || typeof data !== 'object') {
            console.error('[SERVER] Invalid data structure:', typeof data, data);
            return { popular: [], newArrivals: [] };
        }
        
        const popular = Array.isArray(data.popular) ? data.popular : [];
        const newArrivals = Array.isArray(data.newArrivals) ? data.newArrivals : [];
        
        console.log('[SERVER] Featured books parsed:', { 
            popular: popular.length, 
            newArrivals: newArrivals.length 
        });
        
        return { popular, newArrivals };
    } catch (error: any) {
        console.error('[SERVER] Failed to fetch featured books:', error?.message || error);
        console.error('[SERVER] Error stack:', error?.stack);
        return { popular: [], newArrivals: [] };
    }
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations();
    const featured = await getFeaturedBooksData();
    
    // Debug: логируем данные для проверки
    console.log('[SERVER] Featured books on page:', {
        popularCount: featured.popular?.length || 0,
        newArrivalsCount: featured.newArrivals?.length || 0,
        hasPopular: !!featured.popular,
        hasNewArrivals: !!featured.newArrivals,
    });

    return (
        <div className="relative w-full min-h-screen flex flex-col overflow-hidden">
            {/* Background patterns */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]"></div>
            <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 opacity-30 blur-[100px] dark:bg-indigo-500/10"></div>

            <main className="flex-1 relative z-10 w-full">
                <section className="container relative max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32 mx-auto">
                    <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-8 text-center select-none">

                        <div className="inline-flex items-center rounded-full border border-gray-200 bg-white/50 px-3 py-1 text-sm font-medium text-gray-800 backdrop-blur-md shadow-sm dark:border-gray-800 dark:bg-black/50 dark:text-gray-200">
                            <Sparkles className="mr-2 h-3 w-3 text-indigo-500 fill-indigo-500 animate-pulse" />
                            {t('hero.badge')}
                        </div>

                        <h1 className="font-heading text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl md:text-7xl">
                            {t('hero.title')}
                        </h1>

                        <p className="max-w-[42rem] text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-8">
                            {t('hero.subtitle')}
                        </p>

                        <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
                            <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30" asChild>
                                <Link href="/catalog">
                                    <Search className="mr-2 h-4 w-4" />
                                    {t('hero.browseBooks')}
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="h-12 px-8 text-base font-medium backdrop-blur-sm transition-all hover:bg-accent/50" asChild>
                                <Link href="/upload">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    {t('hero.listBook')}
                                </Link>
                            </Button>
                        </div>

                        <div className="mt-8 flex flex-col items-center gap-4 text-sm text-muted-foreground sm:flex-row">
                            <div className="flex -space-x-4 rtl:space-x-reverse">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                        <span className="text-xs font-bold">{String.fromCharCode(64 + i)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-center sm:items-start pl-2">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p>{t('hero.trustedBy')} <span className="font-semibold text-foreground">1,000+ {t('hero.readers')}</span></p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Books Section */}
                {((featured.popular && featured.popular.length > 0) || (featured.newArrivals && featured.newArrivals.length > 0)) ? (
                    <section className="container relative max-w-7xl px-4 py-16 sm:px-6 lg:px-8 mx-auto">
                        {featured.popular && featured.popular.length > 0 && (
                            <div className="mb-16">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-bold text-stone-900">Популярное</h2>
                                    <Link href={`/${locale}/catalog`} className="text-orange-600 hover:text-orange-700 font-medium">
                                        Смотреть все →
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {featured.popular.map((book: PublicBook) => (
                                        <BookCard
                                            key={book.id}
                                            id={book.id}
                                            title={book.title}
                                            author={book.author}
                                            dailyPrice={book.dailyPrice}
                                            images={book.images || []}
                                            status={book.status}
                                            owner={book.owner}
                                            locale={locale}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {featured.newArrivals && featured.newArrivals.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-bold text-stone-900">Новинки</h2>
                                    <Link href={`/${locale}/catalog`} className="text-orange-600 hover:text-orange-700 font-medium">
                                        Смотреть все →
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {featured.newArrivals.map((book: PublicBook) => (
                                        <BookCard
                                            key={book.id}
                                            id={book.id}
                                            title={book.title}
                                            author={book.author}
                                            dailyPrice={book.dailyPrice}
                                            images={book.images || []}
                                            status={book.status}
                                            owner={book.owner}
                                            locale={locale}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                ) : (
                    <section className="container relative max-w-7xl px-4 py-16 sm:px-6 lg:px-8 mx-auto">
                        <div className="text-center text-stone-500">
                            <p>Книги загружаются...</p>
                            <p className="text-sm mt-2">Популярных: {featured.popular?.length || 0}, Новинок: {featured.newArrivals?.length || 0}</p>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
