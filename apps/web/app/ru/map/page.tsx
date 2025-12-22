"use client";

import dynamic from "next/dynamic";
import { Navbar } from "@/components/navbar-ru";

const BooksMap = dynamic(() => import("@/components/BooksMap"), { 
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-stone-50">
            <p className="text-stone-600">Загрузка карты...</p>
        </div>
    )
});

export default function MapPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF9]">
            <Navbar />
            <BooksMap locale="ru" />
        </div>
    );
}
