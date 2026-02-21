import type { LatLngExpression } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import Theme from "./../styles/Theme.module.scss";
import "./../styles/Results.scss";
import Widget from "./Widget";
import { calculateHaversineDistance, midpoint } from "../utils/Coordinates";
import PushButton from "./PushButton";
import { FaHome } from "react-icons/fa";
import { IoIosRefresh } from "react-icons/io";
import { FaMapMarkedAlt } from "react-icons/fa";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

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

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
    const [isOpening, setIsOpening] = useState(true);

    const resultsRef = useRef<HTMLDivElement>(null);
    const [leaving, setLeaving] = useState<ResultsLeaveMode>("None");

    function handleHome() {
        setLeaving("Home");
    }

    function handleRestart() {
        setLeaving("Restart");
    }

    function handleOpenMaps() {
        window.open(
            `https://www.google.com/maps/search/?api=1&query=${answer.latlng[0]},${answer.latlng[1]}`,
            "_blank",
        );
    }

    useGSAP(() => {
        gsap.set(".map, .info", {
            opacity: 0,
        });
        gsap.to(".map, .info", {
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            overwrite: "auto",
        });

        if (!isMobile) {
            gsap.set(".info", {
                top: `calc(1.5 * ${Theme.spacing_1})`,
            });
        }

        gsap.set(".info .child", {
            opacity: 0,
        });
        const infoChildrenTween = gsap.to(".info .child", {
            opacity: 1,
            duration: 1,
            delay: 0.5,
            stagger: 0.25,
            ease: "power2.out",
        });
        gsap.to(".info", {
            top: Theme.spacing_1,
            duration: infoChildrenTween.duration(),
            ease: "sine.out",
            onComplete: () => {
                setIsOpening(false);
            }
        });

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 800);
        };
        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useGSAP(
        () => {
            if (isMobile) {
                gsap.to(".info", {
                    top: "auto",
                    duration: 0,
                    overwrite: "auto",
                });
                return;
            }

            if (!isOpening) {
                gsap.to(".info", {
                    top: Theme.spacing_1,
                    duration: 0,
                });
            }
        },
        { dependencies: [isMobile, isOpening], scope: resultsRef },
    );

    useGSAP(
        () => {
            if (leaving === "None") return;
            const tl = gsap.timeline();
            tl.to(".info .child", {
                opacity: 0,
                duration: 0.25,
                ease: "power2.out",
            }).to(".info, .map", {
                opacity: 0,
                stagger: 0.25,
                duration: 0.5,
                ease: "power2.out",
            });
            const leaveId = setTimeout(() => {
                if (leaving === "Home") {
                    onHome();
                } else if (leaving === "Restart") {
                    onReset();
                }
            }, tl.duration() * 1000);

            return () => {
                clearTimeout(leaveId);
            };
        },
        { dependencies: [leaving], scope: resultsRef },
    );

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
                            haversineDistance={haversineDistance}
                        />
                    </>
                )}
            </MapContainer>
            <InfoWidget
                answer={answer}
                onHome={handleHome}
                onReset={handleRestart}
                onOpenMaps={handleOpenMaps}
                error={haversineDistance}
                disabled={leaving !== "None"}
                className={isMobile ? "mobile" : ""}
            />
        </div>
    );
};

const InfoWidget = ({
    answer,
    onHome,
    onReset,
    onOpenMaps,
    error,
    disabled,
    className,
    ...props
}: InfoWidgetAttributes) => {
    return (
        <Widget className={`info ${className}`} {...props}>
            <h2 className="child">{`"${answer.name}"`}</h2>
            <div className="data">
                <p className="child">
                    <b>Coordinates:</b>
                </p>
                <p className="child">{`${answer.latlng[0].toFixed(4)}, ${answer.latlng[1].toFixed(4)}`}</p>
            </div>
            <div className="data">
                <p className="child">
                    <b>Error:</b>
                </p>
                <p className="child">{`${error.toFixed(2)}km`}</p>
            </div>
            <div className="controls">
                <PushButton
                    className="child"
                    onClick={onHome}
                    disabled={disabled}
                >
                    <FaHome />
                </PushButton>
                <PushButton
                    className="child"
                    onClick={onReset}
                    disabled={disabled}
                >
                    <IoIosRefresh />
                </PushButton>
                <PushButton className="child" onClick={onOpenMaps}>
                    <FaMapMarkedAlt />
                </PushButton>
            </div>
        </Widget>
    );
};

export default Results;
