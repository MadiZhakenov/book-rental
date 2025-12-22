"use client";

import { Star } from "lucide-react";
import { Review } from "@/lib/api";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface BookReviewsProps {
    reviews: Review[];
    averageRating: number;
    reviewsCount: number;
}

export function BookReviews({ reviews, averageRating, reviewsCount }: BookReviewsProps) {
    if (reviews.length === 0) {
        return (
            <div className="p-8 bg-white rounded-xl border border-stone-200 text-center">
                <Star className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                <p className="text-stone-600 font-medium">
                    Станьте первым, кто оценит эту книгу
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4 pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`h-5 w-5 ${
                                    star <= Math.round(averageRating)
                                        ? "fill-orange-500 text-orange-500"
                                        : "text-stone-300"
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-lg font-bold text-stone-900">
                        {averageRating.toFixed(1)}
                    </span>
                </div>
                <span className="text-stone-500">
                    {reviewsCount} {reviewsCount === 1 ? "отзыв" : reviewsCount < 5 ? "отзыва" : "отзывов"}
                </span>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm"
                    >
                        <div className="flex items-start gap-4">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {review.author.avatarUrl ? (
                                    <img
                                        src={review.author.avatarUrl}
                                        alt={review.author.email}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-600">
                                        {review.author.email.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h4 className="font-bold text-stone-900">
                                        {review.author.email.split("@")[0]}
                                    </h4>
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-4 w-4 ${
                                                    star <= review.rating
                                                        ? "fill-orange-500 text-orange-500"
                                                        : "text-stone-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {review.comment && (
                                    <p className="text-stone-600 mb-2 whitespace-pre-wrap">
                                        {review.comment}
                                    </p>
                                )}

                                <p className="text-xs text-stone-400">
                                    {format(new Date(review.createdAt), "d MMMM yyyy", { locale: ru })}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


