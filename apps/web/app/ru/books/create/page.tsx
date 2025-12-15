"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { authApi, getAuthToken, uploadFile, createBook, CreateBookDto } from "@/lib/api";
import { Upload, X, AlertCircle, Crown } from "lucide-react";

const createBookSchema = z.object({
    images: z.array(z.string()).min(1, "Загрузите хотя бы одно изображение"),
    title: z.string().min(1, "Название обязательно"),
    author: z.string().min(1, "Автор обязателен"),
    publishYear: z
        .union([z.number().int().positive(), z.literal(""), z.null(), z.undefined()])
        .optional()
        .transform((val): number | undefined => {
            if (val === "" || val === null || val === undefined) return undefined;
            if (typeof val === "number") return val;
            return undefined;
        }),
    isbn: z.string().optional(),
    description: z.string().optional(),
    dailyPrice: z.number().positive("Цена должна быть больше 0"),
    deposit: z.number().positive("Залог должен быть больше 0"),
});

type CreateBookForm = z.infer<typeof createBookSchema>;

export default function CreateBookPage() {
    const router = useRouter();
    const locale = "ru";
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [error, setError] = useState("");
    const [currentStep, setCurrentStep] = useState(1);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm({
        resolver: zodResolver(createBookSchema),
        defaultValues: {
            images: [],
            title: "",
            author: "",
            publishYear: undefined,
            isbn: "",
            description: "",
            dailyPrice: 0,
            deposit: 0,
        },
    });

    const watchedImages = watch("images");

    useEffect(() => {
        const checkAuth = async () => {
            const token = getAuthToken();
            if (!token) {
                router.push(`/${locale}/auth/login`);
                return;
            }

            try {
                await authApi.getMe();
            } catch (error) {
                router.push(`/${locale}/auth/login`);
                return;
            } finally {
                setIsCheckingAuth(false);
            }
        };

        checkAuth();
    }, [router, locale]);

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Файл должен быть изображением");
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            const url = await uploadFile(file);
            const currentImages = watchedImages || [];
            setValue("images", [...currentImages, url]);
        } catch (err: any) {
            setError(err.response?.data?.message || "Ошибка загрузки изображения");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const removeImage = (index: number) => {
        const currentImages = watchedImages || [];
        setValue(
            "images",
            currentImages.filter((_, i) => i !== index)
        );
    };

    const onSubmit = async (data: z.infer<typeof createBookSchema>) => {
        try {
            setIsLoading(true);
            setError("");

            const bookData: CreateBookDto = {
                title: data.title,
                author: data.author,
                images: data.images,
                dailyPrice: data.dailyPrice,
                deposit: data.deposit,
                ...(data.isbn && { isbn: data.isbn }),
                ...(data.description && { description: data.description }),
                ...(data.publishYear && typeof data.publishYear === "number" && { publishYear: data.publishYear }),
            };

            await createBook(bookData);
            router.push(`/${locale}/profile`);
        } catch (err: any) {
            if (err.response?.status === 403) {
                setError("Лимит книг исчерпан. Купите Premium для безлимитного доступа.");
            } else {
                setError(err.response?.data?.message || "Ошибка создания книги");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#FAFAF9]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 rounded-full bg-stone-200 mb-4"></div>
                    <div className="h-4 w-32 bg-stone-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAF9] py-12 font-manrope">
            <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-8 border border-stone-100">
                    <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mb-8">
                        Сдать книгу в аренду
                    </h1>

                    {error && (
                        <div className="mb-6 rounded-xl bg-red-50 p-4 flex items-start gap-3 border border-red-200">
                            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-600">{error}</p>
                                {error.includes("Лимит") && (
                                    <Button
                                        className="mt-3 bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                                        onClick={() => router.push(`/${locale}/profile`)}
                                    >
                                        <Crown className="mr-2 h-4 w-4" />
                                        Купить Premium
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Step 1: Images */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-stone-900 font-bold text-lg mb-4 block">
                                        Шаг 1: Фото книги
                                    </Label>
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        className="border-2 border-dashed border-stone-300 rounded-xl p-12 text-center bg-stone-50/50 hover:border-orange-400 transition-colors cursor-pointer"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileInput}
                                            className="hidden"
                                            id="file-upload"
                                            disabled={isLoading}
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <Upload className="mx-auto h-12 w-12 text-stone-400 mb-4" />
                                            <p className="text-stone-600 font-medium mb-1">
                                                Перетащите изображение сюда или нажмите для выбора
                                            </p>
                                            <p className="text-sm text-stone-500">
                                                JPEG, PNG, WebP (макс. 5MB)
                                            </p>
                                        </label>
                                    </div>

                                    {watchedImages && watchedImages.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {watchedImages.map((url, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={url}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-32 object-cover rounded-lg border border-stone-200"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {errors.images && (
                                        <p className="text-sm text-red-600 font-medium mt-2">
                                            {errors.images.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                                        disabled={!watchedImages || watchedImages.length === 0}
                                    >
                                        Далее
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Book Data */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-stone-900 font-bold text-lg mb-4 block">
                                        Шаг 2: Данные о книге
                                    </Label>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="title" className="text-stone-900 font-bold">
                                                Название *
                                            </Label>
                                            <Input
                                                id="title"
                                                placeholder="Например, Война и мир"
                                                {...register("title")}
                                                className="mt-1"
                                            />
                                            {errors.title && (
                                                <p className="text-sm text-red-600 font-medium mt-1">
                                                    {errors.title.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="author" className="text-stone-900 font-bold">
                                                Автор *
                                            </Label>
                                            <Input
                                                id="author"
                                                placeholder="Например, Лев Толстой"
                                                {...register("author")}
                                                className="mt-1"
                                            />
                                            {errors.author && (
                                                <p className="text-sm text-red-600 font-medium mt-1">
                                                    {errors.author.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="publishYear" className="text-stone-900 font-bold">
                                                Год издания
                                            </Label>
                                            <Input
                                                id="publishYear"
                                                type="number"
                                                placeholder="2020"
                                                {...register("publishYear", {
                                                    setValueAs: (v) => {
                                                        if (v === "" || v === null || v === undefined) return undefined;
                                                        const num = parseInt(v, 10);
                                                        return isNaN(num) ? undefined : num;
                                                    },
                                                })}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="isbn" className="text-stone-900 font-bold">
                                                ISBN
                                            </Label>
                                            <Input
                                                id="isbn"
                                                placeholder="978-5-17-123456-7"
                                                {...register("isbn")}
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="text-stone-900 font-bold">
                                                Описание
                                            </Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Расскажите о книге..."
                                                rows={4}
                                                {...register("description")}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentStep(1)}
                                        variant="ghost"
                                        className="text-stone-600"
                                    >
                                        Назад
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentStep(3)}
                                        className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                                    >
                                        Далее
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Conditions */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-stone-900 font-bold text-lg mb-4 block">
                                        Шаг 3: Условия аренды
                                    </Label>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="dailyPrice" className="text-stone-900 font-bold">
                                                Цена за сутки (₽) *
                                            </Label>
                                            <Input
                                                id="dailyPrice"
                                                type="number"
                                                step="0.01"
                                                placeholder="100"
                                                {...register("dailyPrice", {
                                                    valueAsNumber: true,
                                                })}
                                                className="mt-1"
                                            />
                                            {errors.dailyPrice && (
                                                <p className="text-sm text-red-600 font-medium mt-1">
                                                    {errors.dailyPrice.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="deposit" className="text-stone-900 font-bold">
                                                Залог (₽) *
                                            </Label>
                                            <Input
                                                id="deposit"
                                                type="number"
                                                step="0.01"
                                                placeholder="1000"
                                                {...register("deposit", {
                                                    valueAsNumber: true,
                                                })}
                                                className="mt-1"
                                            />
                                            {errors.deposit && (
                                                <p className="text-sm text-red-600 font-medium mt-1">
                                                    {errors.deposit.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentStep(2)}
                                        variant="ghost"
                                        className="text-stone-600"
                                    >
                                        Назад
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Публикуем..." : "Опубликовать"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

