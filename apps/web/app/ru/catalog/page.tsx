"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { BookCard } from "@/components/BookCard";
import { getPublicBooks, PublicBook } from "@/lib/api";
import { Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CatalogPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const locale = "ru";
    
    const [books, setBooks] = useState<PublicBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        const loadBooks = async () => {
            try {
                setIsLoading(true);
                const query: any = {
                    page: currentPage,
                    limit: 12,
                };
                
                const search = searchParams.get('search');
                if (search) {
                    query.search = search;
                }

                const response = await getPublicBooks(query);
                setBooks(response.books);
                setPagination(response.pagination);
            } catch (error) {
                console.error('Failed to load books:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadBooks();
    }, [searchParams, currentPage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1); // Reset to first page when searching
        const params = new URLSearchParams();
        if (searchQuery.trim()) {
            params.append('search', searchQuery.trim());
        }
        router.push(`/${locale}/catalog?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-[#FAFAF9] py-12 font-manrope">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-serif text-stone-900 mb-6">
                        Каталог книг
                    </h1>
                    
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
                            <Input
                                type="text"
                                placeholder="Поиск по названию или автору..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 h-14 bg-white rounded-full shadow-sm border-0 text-base"
                            />
                        </div>
                    </form>
                </div>

                {/* Books Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-stone-100 animate-pulse">
                                <div className="aspect-[2/3] bg-stone-200"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-stone-200 rounded w-1/2"></div>
                                    <div className="h-3 bg-stone-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : !books || books.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center bg-stone-50/50">
                        <BookOpen className="mx-auto h-16 w-16 text-stone-400 mb-4" />
                        <p className="text-stone-600 font-medium text-lg mb-2">
                            {searchParams.get('search') 
                                ? `Ничего не найдено по запросу "${searchParams.get('search')}"`
                                : "Книги пока не добавлены в каталог"
                            }
                        </p>
                        <p className="text-stone-500 text-sm">
                            Попробуйте изменить параметры поиска
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {books.map((book) => (
                                <BookCard
                                    key={book.id}
                                    id={book.id}
                                    title={book.title}
                                    author={book.author}
                                    dailyPrice={book.dailyPrice}
                                    images={book.images}
                                    status={book.status}
                                    owner={book.owner}
                                    locale={locale}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    disabled={pagination.page === 1}
                                    className="rounded-full"
                                >
                                    Назад
                                </Button>
                                <span className="text-stone-600 font-medium">
                                    Страница {pagination.page} из {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="rounded-full"
                                >
                                    Вперед
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

