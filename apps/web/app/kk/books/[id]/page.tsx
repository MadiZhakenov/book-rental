"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPublicBooks, PublicBook, api, createRental, getAuthToken, getBookReviews, Review } from "@/lib/api";
import { Star, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { differenceInDays, format, isAfter, startOfToday } from "date-fns";
import dynamic from "next/dynamic";
import { formatPrice } from "@/lib/utils";
import { BookReviews } from "@/components/BookReviews";

const LocationDisplay = dynamic(() => import("@/components/LocationDisplay"), { ssr: false });

interface BookDetail extends PublicBook {
    description?: string;
    isbn?: string;
    publishYear?: number;
    language?: string;
    genre?: string;
    latitude?: number | null;
    longitude?: number | null;
    location_lat?: number | null;
    location_lng?: number | null;
}

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const locale = "kk";
    const bookId = params?.id as string;
    
    const [book, setBook] = useState<BookDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoadingReviews, setIsLoadingReviews] = useState(false);

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

    useEffect(() => {
        const loadReviews = async () => {
            if (!bookId) return;

            try {
                setIsLoadingReviews(true);
                const reviewsData = await getBookReviews(bookId);
                setReviews(reviewsData);
            } catch (err: any) {
                console.error('Failed to load reviews:', err);
            } finally {
                setIsLoadingReviews(false);
            }
        };

        if (bookId) {
            loadReviews();
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
                        <p className="text-stone-600 text-lg">Кітап табылмады</p>
                        <Link href={`/${locale}/catalog`} className="text-orange-600 hover:text-orange-700 mt-4 inline-block">
                            Каталогқа оралу
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const images = book.images && book.images.length > 0 ? book.images : [];
    const currentImage = images[selectedImageIndex] || null;

    // Calculate rental price
    const calculatePrice = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) return 0;
        const days = differenceInDays(end, start) + 1;
        return days * book.dailyPrice;
    };

    const days = startDate && endDate ? differenceInDays(new Date(endDate), new Date(startDate)) + 1 : 0;
    const totalPrice = calculatePrice();

    const handleSubmit = async () => {
        if (!getAuthToken()) {
            router.push(`/${locale}/auth/login`);
            return;
        }

        if (!startDate || !endDate) {
            setError("Күндерді таңдаңыз");
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const today = startOfToday();

        if (start < today) {
            setError("Басталу күні өткен болуы мүмкін емес");
            return;
        }

        if (end <= start) {
            setError("Аяқталу күні басталу күнінен кейін болуы керек");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccess("");

        try {
            await createRental({
                bookId: book.id,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
            });
            setSuccess("Жалға алу сұрауы сәтті жіберілді!");
            setStartDate("");
            setEndDate("");
            setTimeout(() => {
                router.push(`/${locale}/profile`);
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Сұрау жіберу мүмкін болмады. Кейінірек көріңіз.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAF9] py-12 font-manrope">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link 
                    href={`/${locale}/catalog`}
                    className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Каталогқа оралу
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
                                    {formatPrice(book.dailyPrice)}
                                </span>
                                <span className="text-stone-500">/ күніне</span>
                            </div>
                            {book.deposit > 0 && (
                                <p className="text-sm text-stone-500 mt-2">
                                    Бекітілген сома: {formatPrice(book.deposit)}
                                </p>
                            )}
                        </div>

                        {/* Owner Block */}
                        {book.owner && (
                            <div className="p-6 bg-white rounded-xl border border-stone-200">
                                <h3 className="text-sm font-semibold text-stone-500 mb-3">
                                    Иесі
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
                                    Сипаттама
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
                                    <span className="text-stone-500">Жыл:</span>
                                    <span className="ml-2 text-stone-900">{book.publishYear}</span>
                                </div>
                            )}
                            {book.language && (
                                <div>
                                    <span className="text-stone-500">Тіл:</span>
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

                        {/* Location */}
                        {((book.latitude && book.longitude) || (book.location_lat && book.location_lng)) && (
                            <div className="p-6 bg-white rounded-xl border border-stone-200">
                                <h3 className="text-sm font-semibold text-stone-500 mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Орналасқан жері
                                </h3>
                                <LocationDisplay
                                    latitude={(book.latitude ?? book.location_lat) as number}
                                    longitude={(book.longitude ?? book.location_lng) as number}
                                    title={book.title}
                                />
                            </div>
                        )}

                        {/* Reviews */}
                        <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
                            <h3 className="text-lg font-bold text-stone-900 mb-4">Пікірлер</h3>
                            {isLoadingReviews ? (
                                <p className="text-stone-500">Пікірлер жүктелуде...</p>
                            ) : (
                                <BookReviews
                                    reviews={reviews}
                                    averageRating={book?.averageRating || 0}
                                    reviewsCount={book?.reviewsCount || 0}
                                />
                            )}
                        </div>

                        {/* Booking Section */}
                        <div className="p-6 bg-white rounded-xl border border-stone-200 space-y-4">
                            <h3 className="text-lg font-semibold text-stone-900 mb-4">
                                Кітапты брондау
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="startDate" className="text-stone-700 mb-2 block">
                                        Басталу күні
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        min={format(startOfToday(), "yyyy-MM-dd")}
                                        className="w-full"
                                    />
                                </div>
                                
                                <div>
                                    <Label htmlFor="endDate" className="text-stone-700 mb-2 block">
                                        Аяқталу күні
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate || format(startOfToday(), "yyyy-MM-dd")}
                                        className="w-full"
                                    />
                                </div>

                                {days > 0 && (
                                    <div className="p-4 bg-stone-50 rounded-lg border border-stone-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-stone-600">
                                                {formatPrice(book.dailyPrice)} × {days} {days === 1 ? "күн" : "күн"}
                                            </span>
                                            <span className="text-2xl font-bold text-orange-600">
                                                {formatPrice(totalPrice)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                        {success}
                                    </div>
                                )}

                                <Button
                                    className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-lg font-bold"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !startDate || !endDate}
                                >
                                    {isSubmitting ? "Жіберілуде..." : "Сұрау жіберу"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

