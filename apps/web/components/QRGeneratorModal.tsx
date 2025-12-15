"use client";

import { QRCode } from "react-qr-code";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface QRGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string;
    secret: string;
}

export function QRGeneratorModal({ isOpen, onClose, rentalId, secret }: QRGeneratorModalProps) {
    const qrData = JSON.stringify({
        id: rentalId,
        secret: secret,
        action: "PICKUP",
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>QR код для получения книги</DialogTitle>
                    <DialogDescription>
                        Покажите этот QR код владельцу книги для подтверждения получения
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg">
                    <div className="p-4 bg-white rounded-lg border-2 border-stone-200">
                        <QRCode
                            value={qrData}
                            size={256}
                            level="H"
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                    <p className="mt-4 text-sm text-stone-600 text-center">
                        Владелец книги должен отсканировать этот код
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

