"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import L from "leaflet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Navigation } from "lucide-react";
import MapIconFix from "./MapIconFix";

// Default center: Almaty, Kazakhstan
const DEFAULT_CENTER: [number, number] = [43.238949, 76.889709];
const DEFAULT_ZOOM = 13;

interface LocationPickerProps {
    latitude?: number | null;
    longitude?: number | null;
    onLocationChange: (lat: number, lng: number) => void;
}

export default function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        latitude && longitude ? [latitude, longitude] : null
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    // Initialize map using vanilla Leaflet (more control over lifecycle)
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Clean up any existing Leaflet instance
        const container = containerRef.current;
        if ((container as any)._leaflet_id) {
            delete (container as any)._leaflet_id;
        }

        // Create map
        const map = L.map(container, {
            center: latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            scrollWheelZoom: true,
        });

        // Add tile layer with CartoDB Voyager tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(map);

        // Add click handler
        map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);
            onLocationChange(lat, lng);
        });

        // Add marker if position exists
        if (latitude && longitude) {
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup('Выбранное местоположение');
            markerRef.current = marker;
        }

        mapRef.current = map;

        // Cleanup on unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, []); // Only run once on mount

    // Update marker when position changes
    useEffect(() => {
        if (!mapRef.current) return;

        // Remove existing marker
        if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
        }

        // Add new marker if position exists
        if (position) {
            const marker = L.marker(position).addTo(mapRef.current);
            marker.bindPopup('Выбранное местоположение');
            markerRef.current = marker;
        }
    }, [position]);

    // Update position from props
    useEffect(() => {
        if (latitude && longitude) {
            const newPosition: [number, number] = [latitude, longitude];
            setPosition(newPosition);
            if (mapRef.current) {
                mapRef.current.setView(newPosition, mapRef.current.getZoom());
            }
        }
    }, [latitude, longitude]);

    const handleFindMe = useCallback(() => {
        if (!navigator.geolocation) {
            alert("Геолокация не поддерживается вашим браузером");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                const newPosition: [number, number] = [latitude, longitude];
                setPosition(newPosition);
                onLocationChange(latitude, longitude);
                if (mapRef.current) {
                    mapRef.current.setView(newPosition, 15);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Не удалось определить ваше местоположение. Используйте карту для выбора точки.");
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    }, [onLocationChange]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-stone-900 font-bold">
                    Местоположение книги
                </Label>
                <Button
                    type="button"
                    onClick={handleFindMe}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <Navigation className="h-4 w-4" />
                    Найти меня
                </Button>
            </div>

            <div className="relative h-[300px] w-full rounded-lg overflow-hidden border border-stone-200">
                <MapIconFix />
                <div 
                    ref={containerRef}
                    className="h-full w-full z-0"
                />
            </div>

            {position && (
                <p className="text-sm text-stone-600">
                    Координаты: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
            )}
        </div>
    );
}
