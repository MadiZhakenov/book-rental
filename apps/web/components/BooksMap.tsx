"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { getPublicBooks, PublicBook } from "@/lib/api";
import MapIconFix from "./MapIconFix";
import { formatPrice } from "@/lib/utils";

// Default center: Almaty, Kazakhstan
const DEFAULT_CENTER: [number, number] = [43.238949, 76.889709];
const DEFAULT_ZOOM = 12;

interface BooksMapProps {
    locale: string;
}

export default function BooksMap({ locale }: BooksMapProps) {
    const router = useRouter();
    const [books, setBooks] = useState<PublicBook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // Load books
    useEffect(() => {
        const loadBooks = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await getPublicBooks({ limit: 1000 });
                const booksWithLocation = response.books.filter(
                    (book) =>
                        (book.latitude !== null && book.latitude !== undefined && book.longitude !== null && book.longitude !== undefined) ||
                        (book.location_lat !== null && book.location_lat !== undefined && book.location_lng !== null && book.location_lng !== undefined)
                );
                setBooks(booksWithLocation);
            } catch (err: any) {
                console.error("Failed to load books:", err);
                setError("Не удалось загрузить книги");
            } finally {
                setIsLoading(false);
            }
        };

        loadBooks();
    }, []);

    // Initialize map after loading is complete
    useEffect(() => {
        if (isLoading || mapRef.current || !containerRef.current) return;

        // Clean up any existing Leaflet instance
        const container = containerRef.current;
        if ((container as any)._leaflet_id) {
            delete (container as any)._leaflet_id;
        }

        // Small delay to ensure container has dimensions
        const timer = setTimeout(() => {
            if (!containerRef.current || mapRef.current) return;

            try {
                // Create map
                const map = L.map(containerRef.current, {
                    center: DEFAULT_CENTER,
                    zoom: DEFAULT_ZOOM,
                    scrollWheelZoom: true,
                });

                // Add tile layer
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                }).addTo(map);

                mapRef.current = map;
                setMapReady(true);

                // Force map to recalculate size
                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            } catch (err) {
                console.error("Failed to initialize map:", err);
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                setMapReady(false);
            }
        };
    }, [isLoading]);

    // Add markers when map is ready and books are loaded
    useEffect(() => {
        if (!mapRef.current || !mapReady) return;

        // Remove existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add markers for each book
        books.forEach((book) => {
            const lat = book.latitude ?? book.location_lat;
            const lng = book.longitude ?? book.location_lng;

            if (lat === null || lat === undefined || lng === null || lng === undefined) return;

            const marker = L.marker([lat, lng]).addTo(mapRef.current!);

            // Create popup content
            const popupContent = document.createElement('div');
            popupContent.className = 'flex flex-col gap-2 min-w-[200px]';
            popupContent.innerHTML = `
                ${book.images && book.images.length > 0 
                    ? `<img src="${book.images[0]}" alt="${book.title}" class="w-full h-32 object-cover rounded" />`
                    : ''
                }
                <div>
                    <h3 class="font-bold text-stone-900 text-sm">${book.title}</h3>
                    <p class="text-xs text-stone-600">${book.author}</p>
                            <p class="text-sm font-semibold text-orange-600 mt-1">${formatPrice(book.dailyPrice)}/день</p>
                </div>
                <button 
                    class="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded transition-colors"
                    data-book-id="${book.id}"
                >
                    Открыть
                </button>
            `;

            // Add click handler to button
            const button = popupContent.querySelector('button');
            if (button) {
                button.addEventListener('click', () => {
                    router.push(`/${locale}/books/${book.id}`);
                });
            }

            marker.bindPopup(popupContent);
            markersRef.current.push(marker);
        });
    }, [books, mapReady, locale, router]);

    if (error) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-stone-50">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative h-[calc(100vh-4rem)] w-full">
            <MapIconFix />
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-stone-50 z-10">
                    <p className="text-stone-600">Загрузка карты...</p>
                </div>
            )}
            <div 
                ref={containerRef}
                className="h-full w-full"
                style={{ minHeight: '400px' }}
            />
            {!isLoading && books.length === 0 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-md border border-stone-200 z-20">
                    <p className="text-stone-600 text-sm">Нет книг с указанным местоположением</p>
                </div>
            )}
        </div>
    );
}
