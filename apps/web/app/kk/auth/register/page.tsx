"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi, setAuthToken } from "@/lib/api";

const registerSchema = z.object({
    name: z.string().min(2, "Аты кемінде 2 таңбадан тұруы керек"),
    email: z.string().email("Email форматы дұрыс емес"),
    password: z.string().min(6, "Құпия сөз кемінде 6 таңбадан тұруы керек"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        try {
            setIsLoading(true);
            setError("");
            const response = await authApi.register(data);
            setAuthToken(response.access_token);
            router.push("/kk/profile");
        } catch (err: any) {
            setError(err.response?.data?.message || "Тіркеу қатесі");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden font-manrope bg-[#FAFAF9]">
            {/* Left Side: Form */}
            <div className="flex w-full flex-col justify-center bg-white px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20 xl:px-24 h-full">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10">
                        <h2 className="text-3xl font-extrabold tracking-tight text-stone-900">
                            Тіркелу
                        </h2>
                        <p className="mt-2 text-sm text-stone-600">
                            Аккаунтыңыз бар ма?{" "}
                            <Link href="/kk/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
                                Кіру
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {error && (
                            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-stone-900 font-bold">Атыңыз</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Сержан Ахметов"
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-600 font-medium">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-stone-900 font-bold">Электрондық пошта</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600 font-medium">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-stone-900 font-bold">Құпия сөз</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600 font-medium">{errors.password.message}</p>
                            )}
                        </div>

                        <Button type="submit" className="w-full text-base bg-orange-600 hover:bg-orange-700 text-white" disabled={isLoading}>
                            {isLoading ? "Жүктелуде..." : "Тіркелу"}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right Side: Visual */}
            <div className="hidden relative lg:flex lg:w-1/2 h-full bg-stone-900 items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-stone-800 to-stone-950" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=2228&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay" />
                <div className="relative z-10 px-12 text-center text-white max-w-lg">
                    <h2 className="text-4xl font-extrabold mb-6 tracking-tight">Қоғамдастыққа қосылыңыз</h2>
                    <p className="text-lg text-stone-300 leading-relaxed">
                        Бүгіннен бастап кітап оқып, бөлісіп, алмасуды бастаңыз. Сізді 1000-нан астам кітап күтуде.
                    </p>
                </div>
            </div>
        </div>
    );
}
