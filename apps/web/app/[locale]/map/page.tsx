"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const BooksMap = dynamic(() => import("@/components/BooksMap"), { ssr: false });

export default function MapPage() {
    const params = useParams();
    const locale = (params?.locale as string) || "ru";

    return <BooksMap locale={locale} />;
}


