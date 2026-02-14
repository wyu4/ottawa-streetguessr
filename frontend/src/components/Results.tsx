import type { LatLngExpression } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";

const guessIcon = new L.Icon({
    iconUrl: "/Marker.webp",
    iconSize: [41, 41],
});

const answerIcon = new L.Icon({
    iconUrl: "/Marker2.webp",
    iconSize: [41, 41],
});

const ResultsMapController = ({
    guess,
    answer,
}: ResultsMapControllerAttributes) => {
    const map = useMap();
    const earthRadius = 6371;
    const degreesToRadians = Math.PI / 180;

    function midpoint(latlng1: number[], latlng2: number[]) {
        const lat1 = latlng1[0];
        const lon1 = latlng1[1];
        const lat2 = latlng2[0];
        const lon2 = latlng2[1];

        return [(lat1 + lat2) / 2, (lon1 + lon2) / 2];
    }

    function haversineDistance(latlng1: number[], latlng2: number[]) {
        const lat1 = latlng1[0] * degreesToRadians;
        const lon1 = latlng1[1] * degreesToRadians;
        const lat2 = latlng2[0] * degreesToRadians;
        const lon2 = latlng2[1] * degreesToRadians;

        const deltaLat = lat2 - lat1;
        const deltaLon = lon2 - lon1;

        const a =
            Math.pow(Math.sin(deltaLat / 2), 2) +
            Math.cos(lat1) *
                Math.cos(lat2) *
                Math.pow(Math.sin(deltaLon / 2), 2);

        return 2 * earthRadius * Math.asin(Math.sqrt(a));
    }

    useEffect(() => {
        const center = midpoint(guess, answer) as LatLngExpression;

        const path: LatLngExpression[] = [
            guess as LatLngExpression,
            answer as LatLngExpression,
        ];
        const bounds = L.latLngBounds([
            guess as LatLngExpression,
            answer as LatLngExpression,
        ]);
        map.fitBounds(bounds, {
            padding: [50, 50],
        });
        const distance = L.marker(center, {
            icon: L.divIcon({
                className: "distance",
                html: `<div><p>${haversineDistance(guess, answer).toFixed(2)} km</p></div>`,
            }),
        }).addTo(map);
        const answerMarker = L.marker(answer as LatLngExpression, {
            icon: answerIcon,
        }).addTo(map);
        const guessMarker = L.marker(guess as LatLngExpression, {
            icon: guessIcon,
        }).addTo(map);

        const line = L.polyline(path).addTo(map);

        return () => {
            map.removeLayer(distance);
            map.removeLayer(answerMarker);
            map.removeLayer(guessMarker);
            map.removeLayer(line);
        };
    }, [guess, answer]);

    return null;
};

const Results = ({
    guess,
    answer,
    timeElapsed,
    className = "",
    ...props
}: ResultsAttributes) => {
    return (
        <div className={`results ${className}`} {...props}>
            <MapContainer
                center={
                    (guess === undefined
                        ? answer.latlng
                        : [45.4214, 75.6919]) as LatLngExpression
                }
                zoom={15}
                scrollWheelZoom={true}
                attributionControl={false}
                className="map"
                worldCopyJump={false}
                maxBounds={[
                    [-90, -180],
                    [90, 180],
                ]}
                maxBoundsViscosity={1}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {guess === undefined ? (
                    <Marker
                        position={answer.latlng as LatLngExpression}
                        icon={answerIcon}
                    />
                ) : (
                    <>
                        <ResultsMapController
                            guess={guess}
                            answer={answer.latlng}
                        />
                    </>
                )}
            </MapContainer>
            <div className="info"></div>
        </div>
    );
};

export default Results;
