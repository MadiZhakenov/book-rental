"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { authApi, removeAuthToken, getAuthToken, User, getMyBooks, MyBook, getMyRentals, updateRentalStatus, verifyRental, confirmReturn, Rental } from "@/lib/api";
import { Crown, BookOpen, LogOut, Check, X, Clock, QrCode } from "lucide-react";
import { BookCard } from "@/components/BookCard";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { QRGeneratorModal } from "@/components/QRGeneratorModal";
import { QRScannerModal } from "@/components/QRScannerModal";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [books, setBooks] = useState<MyBook[]>([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(true);
    const [incomingRentals, setIncomingRentals] = useState<Rental[]>([]);
    const [outgoingRentals, setOutgoingRentals] = useState<Rental[]>([]);
    const [isLoadingRentals, setIsLoadingRentals] = useState(false);
    const [qrGeneratorOpen, setQrGeneratorOpen] = useState(false);
    const [qrScannerOpen, setQrScannerOpen] = useState(false);
    const [selectedRental, setSelectedRental] = useState<Rental | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>("");

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
            loadRentals();
        }
    }, [user]);

    const loadRentals = async () => {
        const token = getAuthToken();
        if (!token) return;

        try {
            setIsLoadingRentals(true);
            const [incoming, outgoing] = await Promise.all([
                getMyRentals('incoming'),
                getMyRentals('outgoing'),
            ]);
            setIncomingRentals(incoming);
            setOutgoingRentals(outgoing);
        } catch (error) {
            console.error('Failed to load rentals:', error);
        } finally {
            setIsLoadingRentals(false);
        }
    };

    const handleStatusUpdate = async (rentalId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await updateRentalStatus(rentalId, status);
            await loadRentals();
        } catch (error) {
            console.error('Failed to update rental status:', error);
            alert('Не удалось обновить статус заявки');
        }
    };

    const handleShowQR = (rental: Rental) => {
        if (!rental.pickupSecret) {
            alert('QR код недоступен для этой заявки');
            return;
        }
        setSelectedRental(rental);
        setQrGeneratorOpen(true);
    };

    const handleScanQR = () => {
        setQrScannerOpen(true);
    };

    const handleScanSuccess = async (data: { id: string; secret: string; action: string }) => {
        try {
            await verifyRental(data.id, data.secret, 'PICKUP');
            setSuccessMessage('Книга успешно выдана!');
            await loadRentals();
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Не удалось подтвердить получение книги');
        }
    };

    const handleConfirmReturn = async (rentalId: string) => {
        if (!confirm('Подтвердить возврат книги?')) {
            return;
        }
        try {
            await confirmReturn(rentalId);
            setSuccessMessage('Возврат книги подтвержден!');
            await loadRentals();
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Не удалось подтвердить возврат');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            PENDING: { label: 'Ожидание', className: 'bg-yellow-100 text-yellow-800' },
            APPROVED: { label: 'Одобрено', className: 'bg-green-100 text-green-800' },
            REJECTED: { label: 'Отклонено', className: 'bg-red-100 text-red-800' },
            ACTIVE: { label: 'Активно', className: 'bg-blue-100 text-blue-800' },
            COMPLETED: { label: 'Завершено', className: 'bg-stone-100 text-stone-800' },
        };
        const statusInfo = statusMap[status] || { label: status, className: 'bg-stone-100 text-stone-800' };
        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.className}`}>
                {statusInfo.label}
            </span>
        );
    };

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

                    {/* Tabs Section */}
                    <div className="col-span-1 md:col-span-3 bg-white rounded-3xl p-8 shadow-xl shadow-stone-200/50 border border-stone-100">
                        <Tabs defaultValue="books" className="w-full">
                            <TabsList className="mb-6">
                                <TabsTrigger value="books">Мои книги</TabsTrigger>
                                <TabsTrigger value="incoming">Входящие заявки</TabsTrigger>
                                <TabsTrigger value="outgoing">Мои аренды</TabsTrigger>
                            </TabsList>

                            <TabsContent value="books" className="mt-6">
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
                            </TabsContent>

                            <TabsContent value="incoming" className="mt-6">
                                <h3 className="text-xl font-bold text-stone-900 mb-6">Входящие заявки</h3>
                                {isLoadingRentals ? (
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="bg-stone-50 rounded-xl p-6 animate-pulse">
                                                <div className="h-4 bg-stone-200 rounded w-1/2 mb-2"></div>
                                                <div className="h-3 bg-stone-200 rounded w-1/3"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : incomingRentals.length === 0 ? (
                                    <div className="rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center bg-stone-50/50">
                                        <Clock className="mx-auto h-12 w-12 text-stone-400 mb-4" />
                                        <p className="text-stone-600 font-medium text-lg mb-2">Нет входящих заявок</p>
                                        <p className="text-stone-500 text-sm">Заявки на аренду ваших книг появятся здесь</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {incomingRentals.map((rental) => (
                                            <Card key={rental.id} className="border-stone-200">
                                                <CardContent className="p-6">
                                                    <div className="flex gap-4">
                                                        <div className="w-24 h-32 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                                                            {rental.book.images && rental.book.images.length > 0 ? (
                                                                <img src={rental.book.images[0]} alt={rental.book.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-stone-400">
                                                                    {rental.book.title.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-semibold text-stone-900 mb-2">{rental.book.title}</h4>
                                                            <div className="space-y-2 text-sm text-stone-600 mb-4">
                                                                <p>
                                                                    <span className="font-medium">{rental.user?.email.split('@')[0]}</span> хочет взять книгу
                                                                </p>
                                                                <p>
                                                                    С {format(new Date(rental.startDate), 'd MMMM', { locale: ru })} по {format(new Date(rental.endDate), 'd MMMM', { locale: ru })}
                                                                </p>
                                                                <p className="text-lg font-bold text-orange-600">
                                                                    {rental.totalPrice.toFixed(0)} ₸
                                                                </p>
                                                            </div>
                                                            {rental.status === 'PENDING' && (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        onClick={() => handleStatusUpdate(rental.id, 'APPROVED')}
                                                                        className="bg-green-600 hover:bg-green-700 text-white rounded-full"
                                                                        size="sm"
                                                                    >
                                                                        <Check className="h-4 w-4 mr-2" />
                                                                        Принять
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => handleStatusUpdate(rental.id, 'REJECTED')}
                                                                        variant="outline"
                                                                        className="border-red-200 text-red-600 hover:bg-red-50 rounded-full"
                                                                        size="sm"
                                                                    >
                                                                        <X className="h-4 w-4 mr-2" />
                                                                        Отклонить
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            {rental.status === 'APPROVED' && (
                                                                <Button
                                                                    onClick={handleScanQR}
                                                                    className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                                                                    size="sm"
                                                                >
                                                                    <QrCode className="h-4 w-4 mr-2" />
                                                                    Сканировать QR (Выдать книгу)
                                                                </Button>
                                                            )}
                                                            {rental.status === 'ACTIVE' && (
                                                                <Button
                                                                    onClick={() => handleConfirmReturn(rental.id)}
                                                                    className="bg-green-600 hover:bg-green-700 text-white rounded-full"
                                                                    size="sm"
                                                                >
                                                                    <Check className="h-4 w-4 mr-2" />
                                                                    Подтвердить возврат
                                                                </Button>
                                                            )}
                                                            {rental.status !== 'PENDING' && rental.status !== 'APPROVED' && rental.status !== 'ACTIVE' && getStatusBadge(rental.status)}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="outgoing" className="mt-6">
                                <h3 className="text-xl font-bold text-stone-900 mb-6">Мои аренды</h3>
                                {isLoadingRentals ? (
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="bg-stone-50 rounded-xl p-6 animate-pulse">
                                                <div className="h-4 bg-stone-200 rounded w-1/2 mb-2"></div>
                                                <div className="h-3 bg-stone-200 rounded w-1/3"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : outgoingRentals.length === 0 ? (
                                    <div className="rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center bg-stone-50/50">
                                        <BookOpen className="mx-auto h-12 w-12 text-stone-400 mb-4" />
                                        <p className="text-stone-600 font-medium text-lg mb-2">У вас нет активных аренд</p>
                                        <p className="text-stone-500 text-sm">Ваши запросы на аренду книг появятся здесь</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {outgoingRentals.map((rental) => (
                                            <Card key={rental.id} className="border-stone-200">
                                                <CardContent className="p-6">
                                                    <div className="flex gap-4">
                                                        <div className="w-24 h-32 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                                                            {rental.book.images && rental.book.images.length > 0 ? (
                                                                <img src={rental.book.images[0]} alt={rental.book.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-stone-400">
                                                                    {rental.book.title.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-lg font-semibold text-stone-900 mb-2">{rental.book.title}</h4>
                                                            <div className="space-y-2 text-sm text-stone-600 mb-4">
                                                                <p>
                                                                    С {format(new Date(rental.startDate), 'd MMMM', { locale: ru })} по {format(new Date(rental.endDate), 'd MMMM', { locale: ru })}
                                                                </p>
                                                                <p className="text-lg font-bold text-orange-600">
                                                                    {rental.totalPrice.toFixed(0)} ₸
                                                                </p>
                                                            </div>
                                                            {rental.status === 'APPROVED' && (
                                                                <div className="space-y-2">
                                                                    <Button
                                                                        onClick={() => handleShowQR(rental)}
                                                                        className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                                                                        size="sm"
                                                                    >
                                                                        <QrCode className="h-4 w-4 mr-2" />
                                                                        Показать QR для получения
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            {rental.status === 'ACTIVE' && (
                                                                <div className="space-y-2">
                                                                    <p className="text-green-600 font-semibold mb-2">✓ Книга у вас</p>
                                                                    <p className="text-sm text-stone-600">
                                                                        Верните книгу в срок до {format(new Date(rental.endDate), 'd MMMM yyyy', { locale: ru })}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {rental.status !== 'APPROVED' && rental.status !== 'ACTIVE' && getStatusBadge(rental.status)}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
                        <Check className="h-5 w-5" />
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* QR Modals */}
                {selectedRental && selectedRental.pickupSecret && (
                    <QRGeneratorModal
                        isOpen={qrGeneratorOpen}
                        onClose={() => {
                            setQrGeneratorOpen(false);
                            setSelectedRental(null);
                        }}
                        rentalId={selectedRental.id}
                        secret={selectedRental.pickupSecret}
                    />
                )}

                <QRScannerModal
                    isOpen={qrScannerOpen}
                    onClose={() => setQrScannerOpen(false)}
                    onScanSuccess={handleScanSuccess}
                />
            </div>
        </div>
    );
}
