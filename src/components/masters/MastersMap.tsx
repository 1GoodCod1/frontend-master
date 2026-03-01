import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Leaflet + bundlers
const leafletDefaultIconProto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
delete leafletDefaultIconProto._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Master {
    id?: string;
    slug?: string | null;
    userId?: string;
    latitude?: number | null;
    longitude?: number | null;
    rating?: number | null;
    isOnline?: boolean | null;
    availabilityStatus?: string | null;
    user?: { firstName?: string | null; lastName?: string | null } | null;
    displayName?: string | null;
    city?: { name?: string | null } | null;
    category?: { name?: string | null } | null;
}

interface MastersMapProps {
    masters: Master[];
    className?: string;
}

function createCustomIcon(master: Master) {
    const isOnline = master.isOnline === true && master.availabilityStatus === 'AVAILABLE';
    const color = isOnline ? '#22c55e' : '#f59e0b';
    const borderColor = isOnline ? '#16a34a' : '#d97706';

    return L.divIcon({
        html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid ${borderColor};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s;
      ">
        ★
      </div>
    `,
        className: 'masters-map-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
    });
}

export function MastersMap({ masters, className }: MastersMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    const mastersWithCoords = masters.filter(
        (m) => m.latitude != null && m.longitude != null
    );

    useEffect(() => {
        if (!mapRef.current) return;

        // Initialize map if not yet created
        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current, {
                center: [47.0105, 28.8638], // Chisinau, Moldova
                zoom: 10,
                zoomControl: true,
                attributionControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 18,
            }).addTo(mapInstance.current);
        }

        const map = mapInstance.current;

        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Add markers
        const markers: L.Marker[] = [];
        mastersWithCoords.forEach((master) => {
            const lat = master.latitude!;
            const lng = master.longitude!;
            const name =
                master.displayName ||
                `${master.user?.firstName || ''} ${master.user?.lastName || ''}`.trim() ||
                'Master';
            const rating = master.rating ? `⭐ ${master.rating.toFixed(1)}` : '';
            const isAvailable = master.isOnline && master.availabilityStatus === 'AVAILABLE';
            const statusText = isAvailable ? '🟢 Online' : '🔴 Offline';
            const masterId = master.slug || master.id;

            const marker = L.marker([lat, lng], {
                icon: createCustomIcon(master),
            }).addTo(map);

            marker.bindPopup(`
        <div style="min-width: 180px; font-family: Inter, system-ui, sans-serif;">
          <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">${name}</div>
          ${master.category?.name ? `<div style="font-size: 12px; color: #888; margin-bottom: 2px;">📂 ${master.category.name}</div>` : ''}
          ${master.city?.name ? `<div style="font-size: 12px; color: #888; margin-bottom: 2px;">📍 ${master.city.name}</div>` : ''}
          ${rating ? `<div style="font-size: 13px; margin-bottom: 2px;">${rating}</div>` : ''}
          <div style="font-size: 12px; margin-bottom: 6px;">${statusText}</div>
          <a href="/masters/${masterId}" style="
            display: inline-block;
            padding: 4px 12px;
            background: #f59e0b;
            color: #1a1a1a;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
          ">View Profile →</a>
        </div>
      `, { closeButton: true, maxWidth: 250 });

            marker.on('click', () => {
                // Popup is handled above
            });

            markers.push(marker);
        });

        // Fit bounds if we have markers
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.2), { maxZoom: 13 });
        }

        return () => {
            // Don't destroy map on re-renders, just clear markers
        };
    }, [mastersWithCoords.length, mastersWithCoords.map(m => m.id || m.slug).join(',')]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    if (mastersWithCoords.length === 0) {
        return (
            <div
                className={`rounded-xl border-2 border-[#f5f4eb] dark:border-white/[0.08] bg-card flex items-center justify-center ${className || ''}`}
                style={{ minHeight: 400 }}
            >
                <div className="text-center p-8">
                    <div className="text-4xl mb-3">🗺️</div>
                    <p className="text-muted-foreground font-medium">No masters with coordinates found</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Masters need to set their location to appear on the map</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={mapRef}
            className={`rounded-xl border-2 border-[#f5f4eb] dark:border-white/[0.08] overflow-hidden shadow-xl shadow-amber-900/20 dark:shadow-none ${className || ''}`}
            style={{ minHeight: 400, height: '100%', width: '100%', zIndex: 0 }}
        />
    );
}
