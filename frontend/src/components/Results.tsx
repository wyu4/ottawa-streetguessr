import type { LatLngExpression } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import "./../styles/Results.scss";
import Widget from "./Widget";
import { calculateHaversineDistance, midpoint } from "../utils/Coordinates";
import PushButton from "./PushButton";
import { FaHome } from "react-icons/fa";
import { IoIosRefresh } from "react-icons/io";
import { FaMapMarkedAlt } from "react-icons/fa";
import gsap from "gsap";

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
    haversineDistance,
}: ResultsMapControllerAttributes) => {
    const map = useMap();

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
            padding: [100, 100],
        });
        const distance = L.marker(center, {
            icon: L.divIcon({
                className: "distance",
                html: `<div><p>${haversineDistance.toFixed(2)} km</p></div>`,
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
    }, [guess, answer, map, haversineDistance]);

    return null;
};

const Results = ({
    guess,
    answer,
    className = "",
    onHome = () => {},
    onReset = () => {},
    ...props
}: ResultsAttributes) => {
    const haversineDistance = useMemo(() => {
        if (guess === undefined) return 0;
        return calculateHaversineDistance(guess, answer.latlng);
    }, [guess, answer]);

    const resultsRef = useRef<HTMLDivElement>(null);
    const [debounce, setDebounce] = useState(false);

    function handleHome() {
        setDebounce(false);
        gsap.to(".results", {
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            overwrite: "auto",
            onComplete: onHome,
        });
    }

    function handleRestart() {
        setDebounce(false);
        gsap.to(".results", {
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            overwrite: "auto",
            onComplete: onReset,
        });
    }

    function handleMaps() {
        window.open(
            `https://www.google.com/maps/search/?api=1&query=${answer.latlng[0]},${answer.latlng[1]}`,
            "_blank",
        );
    }

    return (
        <div className={`results ${className}`} {...props} ref={resultsRef}>
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
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"/>
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
                            haversineDistance={haversineDistance}
                        />
                    </>
                )}
            </MapContainer>
            <Widget className="info">
                <h2>{`"${answer.name}"`}</h2>
                <div className="data">
                    <p>
                        <b>Coordinates:</b>
                    </p>
                    <p>{`${answer.latlng[0].toFixed(4)}, ${answer.latlng[1].toFixed(4)}`}</p>
                </div>
                <div className="data">
                    <p>
                        <b>Error:</b>
                    </p>
                    <p>{`${haversineDistance.toFixed(2)}km`}</p>
                </div>
                <div className="controls">
                    <PushButton onClick={handleHome} disabled={debounce}>
                        <FaHome />
                    </PushButton>
                    <PushButton onClick={handleRestart} disabled={debounce}>
                        <IoIosRefresh />
                    </PushButton>
                    <PushButton onClick={handleMaps}>
                        <FaMapMarkedAlt />
                    </PushButton>
                </div>
            </Widget>
        </div>
    );
};

export default Results;
