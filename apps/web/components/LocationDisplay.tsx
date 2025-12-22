"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import MapIconFix from "./MapIconFix";

interface LocationDisplayProps {
    latitude: number;
    longitude: number;
    title?: string;
}

export default function LocationDisplay({ latitude, longitude, title }: LocationDisplayProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        // Clean up any existing Leaflet instance
        const container = containerRef.current;
        if ((container as any)._leaflet_id) {
            delete (container as any)._leaflet_id;
        }

        // Create map
        const map = L.map(container, {
            center: [latitude, longitude],
            zoom: 15,
            scrollWheelZoom: false,
            dragging: true,
            zoomControl: true,
        });

        // Add tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }).addTo(map);

        // Add marker
        const marker = L.marker([latitude, longitude]).addTo(map);
        if (title) {
            marker.bindPopup(title);
        }

        mapRef.current = map;

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [latitude, longitude, title]);

    return (
        <div className="space-y-2">
            <MapIconFix />
            <div 
                ref={containerRef}
                className="h-[200px] w-full rounded-lg overflow-hidden border border-stone-200"
            />
        </div>
    );
}


