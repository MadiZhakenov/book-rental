"use client";

import { useEffect, useRef, useState } from "react";
import { getRentalMessages, sendMessage, Message } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { format } from "date-fns";
import { ru, kk } from "date-fns/locale";
import useSWR from "swr";

interface ChatBoxProps {
    rentalId: string;
    currentUserId: string;
    locale?: string;
}

export function ChatBox({ rentalId, currentUserId, locale = "ru" }: ChatBoxProps) {
    const [messageContent, setMessageContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Используем SWR для polling сообщений каждые 3 секунды
    const { data: messages = [], mutate } = useSWR<Message[]>(
        `chat-${rentalId}`,
        () => getRentalMessages(rentalId),
        {
            refreshInterval: 3000,
            revalidateOnFocus: true,
        }
    );

    // Auto-scroll при открытии и после отправки
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageContent.trim() || isSending) return;

        setIsSending(true);
        try {
            await sendMessage(rentalId, messageContent.trim());
            setMessageContent("");
            // Обновляем сообщения после отправки
            mutate();
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-stone-50 rounded-lg border border-stone-200 overflow-hidden">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center text-stone-500 text-sm py-8">
                        {locale === "kk" ? "Хабарлама жоқ. Сөйлесуді бастаңыз!" : "Нет сообщений. Начните общение!"}
                    </div>
                ) : (
                    messages.map((message) => {
                        const isMyMessage = message.senderId === currentUserId;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${
                                        isMyMessage
                                            ? "bg-orange-100 text-stone-900 rounded-tr-none"
                                            : "bg-white text-stone-900 rounded-tl-none border border-stone-200"
                                    }`}
                                >
                                    {!isMyMessage && (
                                        <div className="text-xs text-stone-500 mb-1">
                                            {message.sender.email.split("@")[0]}
                                        </div>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap break-words">
                                        {message.content}
                                    </p>
                                    <p className="text-xs text-stone-500 mt-1">
                                        {format(new Date(message.createdAt), "HH:mm", { locale: locale === "kk" ? kk : ru })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Sticky на мобильных */}
            <form
                onSubmit={handleSend}
                className="sticky bottom-0 border-t border-stone-200 bg-white p-3 flex gap-2"
            >
                <Input
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder={locale === "kk" ? "Хабарлама жазыңыз..." : "Напишите сообщение..."}
                    className="flex-1 rounded-full border-stone-300 focus:border-orange-500 focus:ring-orange-500"
                    disabled={isSending}
                />
                <Button
                    type="submit"
                    disabled={!messageContent.trim() || isSending}
                    className="rounded-full bg-orange-600 hover:bg-orange-700 text-white shrink-0"
                    size="icon"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}

