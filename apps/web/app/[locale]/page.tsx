import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Search, Sparkles, Star } from "lucide-react";
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export function generateStaticParams() {
    return [{ locale: 'ru' }, { locale: 'kk' }];
}

export default async function Home() {
    const t = await getTranslations();

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
            </main>
        </div>
    );
}
