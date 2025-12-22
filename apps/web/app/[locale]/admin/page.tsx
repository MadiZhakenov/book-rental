"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { authApi, adminApi, AdminStats, AdminUser, AdminBook } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, BookOpen, ShoppingBag, AlertCircle, Trash2, Ban } from "lucide-react";

export default function AdminPage() {
    const router = useRouter();
    const params = useParams();
    const locale = (params?.locale as string) || "ru";

    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [books, setBooks] = useState<AdminBook[]>([]);
    const [usersPage, setUsersPage] = useState(1);
    const [booksPage, setBooksPage] = useState(1);
    const [usersTotalPages, setUsersTotalPages] = useState(1);
    const [booksTotalPages, setBooksTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (authorized) {
            if (activeTab === "dashboard") {
                loadStats();
            } else if (activeTab === "users") {
                loadUsers();
            } else if (activeTab === "books") {
                loadBooks();
            }
        }
    }, [authorized, activeTab, usersPage, booksPage]);

    const checkAuth = async () => {
        try {
            const user = await authApi.getMe();
            if (user.role !== "ADMIN") {
                router.push(`/${locale}`);
                return;
            }
            setAuthorized(true);
        } catch (error) {
            router.push(`/${locale}`);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await adminApi.getStats();
            setStats(data);
        } catch (error) {
            console.error("Failed to load stats:", error);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await adminApi.getUsers(usersPage, 10);
            setUsers(data.users);
            setUsersTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error("Failed to load users:", error);
        }
    };

    const loadBooks = async () => {
        try {
            const data = await adminApi.getBooks(booksPage, 10);
            setBooks(data.books);
            setBooksTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error("Failed to load books:", error);
        }
    };

    const handleBanUser = async (userId: string) => {
        if (!confirm("Вы уверены, что хотите заблокировать этого пользователя?")) {
            return;
        }
        try {
            await adminApi.banUser(userId);
            loadUsers();
        } catch (error) {
            console.error("Failed to ban user:", error);
            alert("Ошибка при блокировке пользователя");
        }
    };

    const handleDeleteBook = async (bookId: string) => {
        if (!confirm("Вы уверены, что хотите удалить эту книгу?")) {
            return;
        }
        try {
            await adminApi.deleteBook(bookId);
            loadBooks();
        } catch (error) {
            console.error("Failed to delete book:", error);
            alert("Ошибка при удалении книги");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-stone-600">Загрузка...</div>
            </div>
        );
    }

    if (!authorized) {
        return null;
    }

    return (
        <div className="min-h-screen bg-stone-50 py-8">
            <div className="container max-w-7xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-stone-900 mb-6">Админ-панель</h1>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="dashboard">Дашборд</TabsTrigger>
                        <TabsTrigger value="users">Пользователи</TabsTrigger>
                        <TabsTrigger value="books">Книги</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dashboard">
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <Card className="p-6 bg-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-stone-600 mb-1">Пользователи</p>
                                            <p className="text-3xl font-bold text-stone-900">{stats.totalUsers}</p>
                                        </div>
                                        <Users className="h-12 w-12 text-orange-500" />
                                    </div>
                                </Card>

                                <Card className="p-6 bg-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-stone-600 mb-1">Книги</p>
                                            <p className="text-3xl font-bold text-stone-900">{stats.totalBooks}</p>
                                        </div>
                                        <BookOpen className="h-12 w-12 text-orange-500" />
                                    </div>
                                </Card>

                                <Card className="p-6 bg-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-stone-600 mb-1">Активные аренды</p>
                                            <p className="text-3xl font-bold text-stone-900">{stats.activeRentals}</p>
                                        </div>
                                        <ShoppingBag className="h-12 w-12 text-orange-500" />
                                    </div>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="users">
                        <Card className="p-6 bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Имя</TableHead>
                                        <TableHead>Роль</TableHead>
                                        <TableHead>Статус</TableHead>
                                        <TableHead>Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-mono text-xs">{user.id.slice(0, 8)}...</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    user.role === "ADMIN" 
                                                        ? "bg-orange-100 text-orange-800" 
                                                        : "bg-stone-100 text-stone-800"
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {user.isBlocked ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        Заблокирован
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                                                        Активен
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {!user.isBlocked && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleBanUser(user.id)}
                                                    >
                                                        <Ban className="h-4 w-4 mr-1" />
                                                        Заблокировать
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {usersTotalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        disabled={usersPage === 1}
                                        onClick={() => setUsersPage(usersPage - 1)}
                                    >
                                        Назад
                                    </Button>
                                    <span className="flex items-center px-4 text-sm text-stone-600">
                                        Страница {usersPage} из {usersTotalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={usersPage === usersTotalPages}
                                        onClick={() => setUsersPage(usersPage + 1)}
                                    >
                                        Вперед
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="books">
                        <Card className="p-6 bg-white">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Название</TableHead>
                                        <TableHead>Автор</TableHead>
                                        <TableHead>Владелец</TableHead>
                                        <TableHead>Действия</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {books.map((book) => (
                                        <TableRow key={book.id}>
                                            <TableCell className="font-medium">{book.title}</TableCell>
                                            <TableCell>{book.author}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="text-sm font-medium">{book.owner.name}</div>
                                                    <div className="text-xs text-stone-500">{book.owner.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteBook(book.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Удалить
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {booksTotalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        disabled={booksPage === 1}
                                        onClick={() => setBooksPage(booksPage - 1)}
                                    >
                                        Назад
                                    </Button>
                                    <span className="flex items-center px-4 text-sm text-stone-600">
                                        Страница {booksPage} из {booksTotalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={booksPage === booksTotalPages}
                                        onClick={() => setBooksPage(booksPage + 1)}
                                    >
                                        Вперед
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

