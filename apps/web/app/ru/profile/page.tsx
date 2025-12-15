"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authApi, removeAuthToken, getAuthToken, User, getMyBooks, MyBook } from "@/lib/api";
import { Crown, BookOpen, LogOut } from "lucide-react";
import { BookCard } from "@/components/BookCard";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [books, setBooks] = useState<MyBook[]>([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = getAuthToken();
            if (!token) {
                router.push("/ru/auth/login");
                return;
            }

            try {
                const userData = await authApi.getMe();
                setUser(userData);
            } catch (error) {
                removeAuthToken();
                router.push("/ru/auth/login");
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [router]);

    useEffect(() => {
        const loadBooks = async () => {
            const token = getAuthToken();
            if (!token) {
                return;
            }

            try {
                setIsLoadingBooks(true);
                const booksData = await getMyBooks();
                setBooks(booksData);
            } catch (error) {
                console.error('Failed to load books:', error);
            } finally {
                setIsLoadingBooks(false);
            }
        };

        if (user) {
            loadBooks();
        }
    }, [user]);

    const handleLogout = () => {
        removeAuthToken();
        router.push("/ru");
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FAFAF9]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-stone-200 mb-4"></div>
                    <div className="h-4 w-32 bg-stone-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#FAFAF9] py-12 font-manrope">
            <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Личный кабинет</h1>
                    <Button variant="ghost" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User Card */}
                    <div className="col-span-1 md:col-span-2 bg-white rounded-3xl p-8 shadow-xl shadow-stone-200/50 flex flex-col justify-center border border-stone-100">
                        <div className="flex items-center gap-6">
                            <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center text-3xl font-bold text-orange-600 ring-4 ring-orange-50 shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-stone-900">{user.name}</h2>
                                <p className="text-stone-500 font-medium">{user.email}</p>
                                <div className="mt-3 flex items-center gap-4">
                                    <span className="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-800">
                                        Рейтинг {user.rating.toFixed(1)} ⭐
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Premium Card */}
                    <div className={`col-span-1 rounded-3xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${user.isPremium ? 'bg-stone-800 text-white shadow-stone-900/30' : 'bg-white shadow-stone-200/50 border border-stone-100'}`}>
                        {user.isPremium && <div className="absolute top-0 right-0 p-4 opacity-10"><Crown size={80} /></div>}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {user.isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
                                <h3 className={`text-lg font-semibold ${user.isPremium ? 'text-stone-300' : 'text-stone-500'}`}>Ваш тариф</h3>
                            </div>
                            <p className={`text-3xl font-bold ${user.isPremium ? 'text-white' : 'text-stone-900'}`}>
                                {user.isPremium ? 'Premium' : 'Бесплатный'}
                            </p>
                        </div>
                        {!user.isPremium && (
                            <div className="mt-6">
                                <div className="w-full bg-stone-100 rounded-full h-2 mb-2">
                                    <div className="bg-orange-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${(user.booksCount / 5) * 100}%` }} />
                                </div>
                                <p className="text-sm text-stone-500 mb-4 font-medium">{user.booksCount} / 5 книг</p>
                                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold shadow-lg shadow-orange-500/20">Купить Premium</Button>
                            </div>
                        )}
                        {user.isPremium && (
                            <p className="mt-4 text-stone-400 text-sm font-medium">Безлимитный доступ ко всем возможностям платформы.</p>
                        )}
                    </div>

                    {/* My Books Stats */}
                    <div className="col-span-1 md:col-span-3 bg-white rounded-3xl p-8 shadow-xl shadow-stone-200/50 border border-stone-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-orange-600" />
                                Мои книги
                            </h3>
                            <Button className="rounded-full bg-orange-600 hover:bg-orange-700 text-white" asChild>
                                <a href="/ru/books/create">Добавить книгу</a>
                            </Button>
                        </div>

                        {isLoadingBooks ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => (
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
                        ) : books.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center bg-stone-50/50">
                                <BookOpen className="mx-auto h-12 w-12 text-stone-400 mb-4" />
                                <p className="text-stone-600 font-medium text-lg mb-2">Ваша библиотека пуста</p>
                                <p className="text-stone-500 text-sm mb-6">Начните добавлять книги в свою коллекцию</p>
                                <Button className="rounded-full bg-orange-600 hover:bg-orange-700 text-white" asChild>
                                    <a href="/ru/books/create">Добавить книгу</a>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {books.map((book) => (
                                    <BookCard
                                        key={book.id}
                                        id={book.id}
                                        title={book.title}
                                        author={book.author}
                                        dailyPrice={book.dailyPrice}
                                        images={book.images}
                                        status={book.status}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
