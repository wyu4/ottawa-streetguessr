import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";

function MapViewController({
    zoom = 7,
    center = [45.2501659, -76.1298876],
    lastReset = 0,
    onSelection = () => {},
}: SelectableMapAttributes) {
    const map = useMap();

    useEffect(() => {
        const onMapClick = (event: L.LeafletMouseEvent) => {
            const lat = Math.max(-90, Math.min(90, event.latlng.lat));
            const lng = Math.max(-180, Math.min(180, event.latlng.lng));
            onSelection(lat, lng);
        };
        map.on("click", onMapClick);
        return () => {
            map.off("click", onMapClick);
        };
    }, [map, onSelection]);

    useEffect(() => {
        map.setZoom(zoom);
        map.setView(center);
    }, [lastReset, map]);

    return null;
}

export default function SelectableMap({
    zoom = 8,
    center = [45.40616374516014, -75.69580078125001],
    lastReset = 0,
    selectionEnabled = false,
    onSelection = () => {},
}: SelectableMapAttributes) {
    const [markerPosition, setMarkerPosition] =
        useState<LatLngExpression | null>(null);

    const markerIcon = new L.Icon({
        iconUrl: "/Marker.webp",
        iconSize: [41, 41],
    });

    const handleSelection = (lat: number, lng: number) => {
        if (!selectionEnabled) return;
        setMarkerPosition([lat, lng]);
        onSelection(lat, lng);
    };

    return (
        <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            attributionControl={false}
            className="selectable-map"
            worldCopyJump={false}
            maxBounds={[
                [-90, -180],
                [90, 180],
            ]}
            maxBoundsViscosity={1}
        >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

            {markerPosition == null || !selectionEnabled ? null : (
                <Marker position={markerPosition} icon={markerIcon}></Marker>
            )}

            <MapViewController
                zoom={zoom}
                center={center}
                onSelection={handleSelection}
                lastReset={lastReset}
            />
        </MapContainer>
    );
}
