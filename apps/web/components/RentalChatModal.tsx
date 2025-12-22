"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChatBox } from "./ChatBox";
import { Rental } from "@/lib/api";

interface RentalChatModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rental: Rental;
    currentUserId: string;
    locale?: string;
}

export function RentalChatModal({
    open,
    onOpenChange,
    rental,
    currentUserId,
    locale = "ru",
}: RentalChatModalProps) {
    const otherUser = rental.user?.id === currentUserId 
        ? rental.book.owner 
        : rental.user;

    const chatTitle = otherUser
        ? locale === "kk" 
            ? `${otherUser.email.split("@")[0]} қатысты чат`
            : `Чат с ${otherUser.email.split("@")[0]}`
        : locale === "kk"
            ? "Жалға алу бойынша чат"
            : "Чат по аренде";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-stone-200">
                    <DialogTitle className="text-xl font-semibold text-stone-900">
                        {chatTitle}
                    </DialogTitle>
                    <p className="text-sm text-stone-600 mt-1">
                        {rental.book.title}
                    </p>
                </DialogHeader>
                <div className="px-6 pb-6">
                    <ChatBox
                        rentalId={rental.id}
                        currentUserId={currentUserId}
                        locale={locale}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

