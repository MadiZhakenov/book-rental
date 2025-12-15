"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getPublicBooks, PublicBook, api } from "@/lib/api";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface BookDetail extends PublicBook {
    description?: string;
    isbn?: string;
    publishYear?: number;
    language?: string;
    genre?: string;
}

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const locale = "ru";
    const bookId = params?.id as string;
    
    const [book, setBook] = useState<BookDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    useEffect(() => {
        const loadBook = async () => {
            try {
                setIsLoading(true);
                const response = await api.get(`/books/${bookId}`);
                setBook(response.data);
            } catch (error) {
                console.error('Failed to load book:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (bookId) {
            loadBook();
        }
    }, [bookId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAF9] py-12 font-manrope">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="aspect-[2/3] bg-stone-200 rounded-xl"></div>
                            <div className="space-y-4">
                                <div className="h-8 bg-stone-200 rounded w-3/4"></div>
                                <div className="h-4 bg-stone-200 rounded w-1/2"></div>
                                <div className="h-12 bg-stone-200 rounded w-1/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-[#FAFAF9] py-12 font-manrope">
                <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <p className="text-stone-600 text-lg">Книга не найдена</p>
                        <Link href={`/${locale}/catalog`} className="text-orange-600 hover:text-orange-700 mt-4 inline-block">
                            Вернуться в каталог
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const images = book.images && book.images.length > 0 ? book.images : [];
    const currentImage = images[selectedImageIndex] || null;

    return (
        <div className="min-h-screen bg-[#FAFAF9] py-12 font-manrope">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link 
                    href={`/${locale}/catalog`}
                    className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Назад к каталогу
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="aspect-[2/3] bg-stone-100 rounded-xl overflow-hidden">
                            {currentImage ? (
                                <img
                                    src={currentImage}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600">
                                    <span className="text-6xl font-bold">
                                        {book.title.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all ${
                                            index === selectedImageIndex
                                                ? 'border-orange-600'
                                                : 'border-transparent hover:border-stone-300'
                                        }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${book.title} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-6">
                        {/* Title & Author */}
                        <div>
                            <h1 className="text-4xl font-serif text-stone-900 mb-2">
                                {book.title}
                            </h1>
                            <p className="text-xl text-stone-500">
                                {book.author}
                            </p>
                        </div>

                        {/* Price */}
                        <div className="p-6 bg-white rounded-xl border border-stone-200">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-orange-600">
                                    {book.dailyPrice}
                                </span>
                                <span className="text-xl text-stone-600">₽</span>
                                <span className="text-stone-500">/ сутки</span>
                            </div>
                            {book.deposit > 0 && (
                                <p className="text-sm text-stone-500 mt-2">
                                    Залог: {book.deposit} ₽
                                </p>
                            )}
                        </div>

                        {/* Owner Block */}
                        {book.owner && (
                            <div className="p-6 bg-white rounded-xl border border-stone-200">
                                <h3 className="text-sm font-semibold text-stone-500 mb-3">
                                    Владелец
                                </h3>
                                <div className="flex items-center gap-3">
                                    {book.owner.avatarUrl ? (
                                        <img
                                            src={book.owner.avatarUrl}
                                            alt={book.owner.email}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600">
                                            {book.owner.email.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold text-stone-900">
                                            {book.owner.email.split('@')[0]}
                                        </p>
                                        <div className="flex items-center gap-1 text-sm text-stone-500">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span>4.8</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {book.description && (
                            <div className="p-6 bg-white rounded-xl border border-stone-200">
                                <h3 className="text-sm font-semibold text-stone-500 mb-3">
                                    Описание
                                </h3>
                                <p className="text-stone-700 leading-relaxed">
                                    {book.description}
                                </p>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {book.isbn && (
                                <div>
                                    <span className="text-stone-500">ISBN:</span>
                                    <span className="ml-2 text-stone-900">{book.isbn}</span>
                                </div>
                            )}
                            {book.publishYear && (
                                <div>
                                    <span className="text-stone-500">Год:</span>
                                    <span className="ml-2 text-stone-900">{book.publishYear}</span>
                                </div>
                            )}
                            {book.language && (
                                <div>
                                    <span className="text-stone-500">Язык:</span>
                                    <span className="ml-2 text-stone-900">{book.language}</span>
                                </div>
                            )}
                            {book.genre && (
                                <div>
                                    <span className="text-stone-500">Жанр:</span>
                                    <span className="ml-2 text-stone-900">{book.genre}</span>
                                </div>
                            )}
                        </div>

                        {/* CTA Button */}
                        <Button
                            className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-lg font-bold"
                            onClick={() => {
                                // TODO: Implement booking logic
                                alert('Функция бронирования будет реализована позже');
                            }}
                        >
                            Забронировать
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

