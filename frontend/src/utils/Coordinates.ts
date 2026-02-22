import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

const earthRadius = 6371;
const degreesToRadians = Math.PI / 180;

export const midpoint = (latlng1: number[], latlng2: number[]) => {
    const lat1 = latlng1[0];
    const lon1 = latlng1[1];
    const lat2 = latlng2[0];
    const lon2 = latlng2[1];

    return [(lat1 + lat2) / 2, (lon1 + lon2) / 2];
};

export const calculateHaversineDistance = (
    latlng1: number[],
    latlng2: number[],
) => {
    const lat1 = latlng1[0] * degreesToRadians;
    const lon1 = latlng1[1] * degreesToRadians;
    const lat2 = latlng2[0] * degreesToRadians;
    const lon2 = latlng2[1] * degreesToRadians;

    const deltaLat = lat2 - lat1;
    const deltaLon = lon2 - lon1;

    const a =
        Math.pow(Math.sin(deltaLat / 2), 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2);

    return 2 * earthRadius * Math.asin(Math.sqrt(a));
};

export const WorldBounds: LatLngBoundsExpression = [
    [-90, -180],
    [90, 180],
];

export const OttawaBounds: LatLngBoundsExpression = [
    [45, -76.60],
    [45.5, -75.30],
];
