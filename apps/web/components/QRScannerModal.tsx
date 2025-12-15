"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (data: { id: string; secret: string; action: string }) => void;
}

export function QRScannerModal({ isOpen, onClose, onScanSuccess }: QRScannerModalProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const qrReaderRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string>("");
    const [isScanning, setIsScanning] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Clean up scanner when modal closes
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => {});
                scannerRef.current.clear().catch(() => {});
                scannerRef.current = null;
            }
            return;
        }

        // Wait for element to be available
        const timer = setTimeout(() => {
            if (!qrReaderRef.current) {
                setError("Не удалось инициализировать сканер");
                setIsScanning(false);
                return;
            }

            const startScanning = async () => {
                try {
                    setError("");
                    setIsScanning(true);
                    setSuccess(false);

                    const scanner = new Html5Qrcode(qrReaderRef.current!.id);
                    scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    (decodedText) => {
                        try {
                            const data = JSON.parse(decodedText);
                            if (data.id && data.secret && data.action) {
                                setSuccess(true);
                                scanner.stop().then(() => {
                                    scannerRef.current = null;
                                    setTimeout(() => {
                                        onScanSuccess(data);
                                        onClose();
                                    }, 1000);
                                });
                            } else {
                                setError("Неверный формат QR кода");
                            }
                        } catch (e) {
                            setError("Не удалось прочитать QR код");
                        }
                    },
                    (errorMessage) => {
                        // Ignore scanning errors (they happen frequently)
                    }
                );
            } catch (err: any) {
                console.error("Scanner error:", err);
                if (err.message?.includes("Permission denied")) {
                    setError("Необходимо разрешение на использование камеры");
                } else if (err.message?.includes("NotFoundError")) {
                    setError("Камера не найдена");
                } else {
                    setError("Не удалось запустить сканер. Убедитесь, что используете HTTPS или localhost");
                }
                    setIsScanning(false);
                }
            };

            startScanning();
        }, 100);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                scannerRef.current
                    .stop()
                    .then(() => {
                        scannerRef.current?.clear().catch(() => {});
                        scannerRef.current = null;
                    })
                    .catch(() => {
                        scannerRef.current?.clear().catch(() => {});
                        scannerRef.current = null;
                    });
            }
        };
    }, [isOpen, onClose, onScanSuccess]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Сканирование QR кода</DialogTitle>
                    <DialogDescription>
                        Наведите камеру на QR код арендатора
                    </DialogDescription>
                </DialogHeader>
                <div className="relative">
                    <div ref={qrReaderRef} id="qr-reader" className="w-full rounded-lg overflow-hidden min-h-[300px]" />
                    {success && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-500/90 rounded-lg">
                            <div className="flex flex-col items-center gap-2 text-white">
                                <Check className="h-16 w-16" />
                                <p className="text-lg font-semibold">Успешно!</p>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}
                    {!isScanning && !error && (
                        <div className="mt-4 p-3 bg-stone-50 border border-stone-200 rounded-lg text-stone-700 text-sm">
                            Загрузка камеры...
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

