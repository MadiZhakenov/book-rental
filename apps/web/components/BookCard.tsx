import { BookOpen } from "lucide-react";
import Link from "next/link";

interface BookCardProps {
    id: string;
    title: string;
    author: string;
    dailyPrice: number;
    images: string[];
    status: string;
    owner?: {
        id: string;
        email: string;
        avatarUrl: string | null;
    };
    locale?: string;
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'AVAILABLE':
            return (
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                    Доступна
                </span>
            );
        case 'RENTED':
            return (
                <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-800">
                    В аренде
                </span>
            );
        case 'UNAVAILABLE':
            return (
                <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-800">
                    Недоступна
                </span>
            );
        case 'ARCHIVED':
            return (
                <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-800">
                    Архив
                </span>
            );
        default:
            return null;
    }
};

const getPlaceholderColor = (title: string) => {
    const colors = [
        'bg-orange-100 text-orange-600',
        'bg-stone-100 text-stone-600',
        'bg-amber-100 text-amber-600',
        'bg-yellow-100 text-yellow-600',
    ];
    const index = title.charCodeAt(0) % colors.length;
    return colors[index];
};

export function BookCard({ id, title, author, dailyPrice, images, status, owner, locale = "ru" }: BookCardProps) {
    const imageUrl = images && images.length > 0 ? images[0] : null;
    const firstLetter = title.charAt(0).toUpperCase();

    const cardContent = (
        <>
            {/* Image */}
            <div className="aspect-[2/3] bg-stone-100 relative overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className={`w-full h-full flex items-center justify-center ${getPlaceholderColor(title)}`}>
                        <span className="text-4xl font-bold">{firstLetter}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-stone-900 truncate text-sm">
                            {title}
                        </h3>
                        <p className="text-sm text-stone-500 truncate">
                            {author}
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <p className="text-orange-600 font-bold text-sm">
                        {dailyPrice} ₽/день
                    </p>
                    {getStatusBadge(status)}
                </div>

                {/* Owner info for public catalog */}
                {owner && (
                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                        {owner.avatarUrl ? (
                            <img
                                src={owner.avatarUrl}
                                alt={owner.email}
                                className="w-6 h-6 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                                {owner.email.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs text-stone-500 truncate flex-1">
                            {owner.email.split('@')[0]}
                        </span>
                    </div>
                )}
            </div>
        </>
    );

    // If used in profile (no owner), render without link wrapper
    if (!owner) {
        return (
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-stone-100">
                {cardContent}
            </div>
        );
    }

    // If used in public catalog (with owner), render with link
    return (
        <Link href={`/${locale}/books/${id}`} className="block">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-stone-100 cursor-pointer">
                {cardContent}
            </div>
        </Link>
    );
}

