"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { createReview, Review } from "@/lib/api";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    rentalId: string;
    bookTitle: string;
    onSuccess: () => void;
}

export function ReviewModal({ isOpen, onClose, rentalId, bookTitle, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Пожалуйста, выберите оценку");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            await createReview({
                rentalId,
                rating,
                comment: comment.trim() || undefined,
            });
            onSuccess();
            handleClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Ошибка при создании отзыва");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setHoveredRating(0);
        setComment("");
        setError("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Оценить книгу</DialogTitle>
                    <DialogDescription>
                        Поделитесь своим мнением о книге "{bookTitle}"
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Rating Stars */}
                    <div>
                        <Label className="text-stone-900 font-bold mb-2 block">
                            Оценка *
                        </Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${
                                            star <= (hoveredRating || rating)
                                                ? "fill-orange-500 text-orange-500"
                                                : "text-stone-300"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <Label htmlFor="comment" className="text-stone-900 font-bold mb-2 block">
                            Комментарий (необязательно)
                        </Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Расскажите о вашем опыте..."
                            rows={4}
                            className="resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    )}

                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || rating === 0}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                            {isSubmitting ? "Отправка..." : "Оценить"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


