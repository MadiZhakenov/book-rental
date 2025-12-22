"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { useNotifications } from "@/hooks/useNotifications";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { getAuthToken } from "@/lib/api";

export function NavbarNotifications() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, mutate } = useNotifications();
    const isAuthenticated = !!getAuthToken();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    if (!isAuthenticated) {
        return null;
    }

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = async (notification: typeof notifications[0]) => {
        if (!notification.isRead) {
            await markNotificationAsRead(notification.id);
            mutate();
        }
        setIsOpen(false);
        if (notification.link) {
            router.push(notification.link);
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead();
        mutate();
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'SUCCESS':
                return 'text-green-600';
            case 'WARNING':
                return 'text-orange-600';
            case 'ERROR':
                return 'text-red-600';
            default:
                return 'text-blue-600';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-stone-500 hover:text-stone-900 transition-colors"
                aria-label="Уведомления"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white animate-in fade-in zoom-in-50 duration-200">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-xl border-0 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-stone-200 flex items-center justify-between">
                        <h3 className="font-bold text-stone-900">Уведомления</h3>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-orange-600 hover:text-orange-700"
                            >
                                Прочитать все
                            </Button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-stone-500">
                                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>Нет уведомлений</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-stone-100">
                                {notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`w-full text-left p-4 hover:bg-stone-50 transition-colors ${
                                            !notification.isRead ? 'bg-orange-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                                !notification.isRead 
                                                    ? 'bg-orange-600' 
                                                    : 'bg-transparent'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className={`font-bold text-stone-900 text-sm ${
                                                        getTypeColor(notification.type)
                                                    }`}>
                                                        {notification.title}
                                                    </h4>
                                                    {notification.isRead && (
                                                        <Check className="h-3 w-3 text-stone-400 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-sm text-stone-600 mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-stone-400">
                                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                                        addSuffix: true,
                                                        locale: ru,
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


