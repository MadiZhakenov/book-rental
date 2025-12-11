import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen, Search, Sparkles, Star } from "lucide-react";
import { Navbar } from "@/components/navbar-kk";

export default function KkPage() {
    return (
        <div className="font-manrope bg-[#FAFAF9] min-h-screen flex flex-col text-stone-900">
            <Navbar />

            <main className="flex-1 flex flex-col">
                <section className="relative overflow-hidden flex-1 flex flex-col justify-center py-12 lg:py-0">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                        <div className="absolute top-20 left-1/2 -ml-[40rem] w-[80rem] h-[40rem] bg-stone-500/10 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
                        <div className="absolute top-40 left-1/2 -ml-[10rem] w-[50rem] h-[30rem] bg-orange-400/10 rounded-full blur-[100px] opacity-60 mix-blend-multiply" />
                    </div>

                    <div className="container relative z-10 mx-auto px-4 text-center">
                        <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50/80 px-4 py-1.5 text-sm font-semibold text-orange-700 shadow-sm backdrop-blur-md mb-6 ring-4 ring-orange-50/50">
                            <Sparkles className="mr-2 h-4 w-4 text-orange-600 fill-orange-600 animate-pulse" />
                            Қазақстандағы №1 платформа
                        </div>

                        <h1 className="mx-auto max-w-5xl text-4xl font-extrabold tracking-tight text-stone-900 sm:text-5xl lg:text-7xl mb-6 leading-tight">
                            Көршілеріңізден кітап <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">жалға алыңыз</span>
                        </h1>

                        <p className="mx-auto max-w-2xl text-lg text-stone-600 leading-relaxed mb-8">
                            Ақшаңызды үнемдеңіз, сөрелеріңізді босатыңыз және пікірлестерді табыңыз. Бүгін 10 000-нан астам оқырман қауымдастығына қосылыңыз.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                            <Button size="lg" className="h-12 px-8 text-base font-bold rounded-full bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-600/20 transition-all hover:scale-105 w-full sm:w-auto text-white" asChild>
                                <Link href="/kk/catalog">
                                    <Search className="mr-2 h-5 w-5" />
                                    Кітап іздеу
                                </Link>
                            </Button>
                            <Button variant="outline" size="lg" className="h-12 px-8 text-base font-bold rounded-full border-stone-200 text-stone-700 hover:bg-white hover:text-stone-900 hover:border-stone-300 transition-all shadow-sm w-full sm:w-auto bg-white/50 backdrop-blur-sm" asChild>
                                <Link href="/kk/auth/register">
                                    <BookOpen className="mr-2 h-5 w-5" />
                                    Кітап тапсыру
                                </Link>
                            </Button>
                        </div>

                        {/* Trust Badge */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div className="flex -space-x-3 rtl:space-x-reverse">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-stone-100 text-stone-600 font-bold text-xs ring-2 ring-[#FAFAF9]">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-stone-900 text-white font-bold text-xs ring-2 ring-[#FAFAF9]">
                                    +1k
                                </div>
                            </div>
                            <div className="flex flex-col items-center sm:items-start text-sm">
                                <div className="flex text-amber-500 gap-0.5 mb-0.5">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                                </div>
                                <p className="text-stone-600 font-medium text-xs">Бізге сенеді <span className="text-stone-900 font-bold">1,000+ оқырман</span></p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
