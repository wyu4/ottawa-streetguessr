import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";

function MapViewController({
    zoom,
    center,
}: {
    zoom: number;
    center: LatLngExpression;
}) {
    const map = useMap();
    useEffect(() => {
        if (map.getZoom() !== zoom) {
            map.setZoom(zoom);
        }
        if (map.getCenter() !== center) {
            map.setView(center);
        }
    }, [center, zoom, map]);

    return null;
}

export default function SelectableMap({
    selection = [],
}: SelectableMapAttributes) {
    const defaultCenter: LatLngExpression = [45.2501659, -76.1298876];

    const markerIcon = new L.Icon({
        iconUrl: "/images/Marker.webp",
        iconSize: [41, 41],
    });

    const latLong = useMemo(() => {
        if (selection.length == 2) {
            const [lat, lng] = selection;
            return [lat, lng] as LatLngExpression;
        }
        return null;
    }, [selection]);

    return (
        <MapContainer
            center={defaultCenter}
            zoom={7}
            scrollWheelZoom={true}
            attributionControl={false}
            className="selectable-map"
        >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            {latLong != null ? (
                <Marker position={latLong} icon={markerIcon} />
            ) : null}
            <MapViewController zoom={7} center={defaultCenter} />
        </MapContainer>
    );
}
