import type { LatLngExpression } from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import Theme from "./../styles/Theme.module.scss";
import "./../styles/Results.scss";
import Widget from "./Widget";
import {
    calculateHaversineDistance,
    midpoint,
    OttawaBounds,
    WorldBounds,
} from "../utils/Coordinates";
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
    isMobile,
}: ResultsMapControllerAttributes) => {
    const map = useMap();

    useEffect(() => {
        const center = (
            guess ? midpoint(guess, answer) : answer
        ) as LatLngExpression;

        map.fitBounds(OttawaBounds, {
            animate: false,
        });
        const fitDelay = setTimeout(() => {
            if (guess) {
                const bounds = L.latLngBounds([
                    guess as LatLngExpression,
                    answer as LatLngExpression,
                ]);
                map.fitBounds(bounds, {
                    paddingBottomRight: isMobile
                        ? [50, 50]
                        : [50 + window.innerWidth / 3, window.innerWidth / 10],
                    paddingTopLeft: isMobile
                        ? [50, 50]
                        : [window.innerWidth / 10, 50 + window.innerHeight / 4],
                    animate: true,
                });
                return;
            }
            map.setView(answer as LatLngExpression, 13, {
                animate: true,
            });
        }, 500);

        const distance = L.marker(center, {
            icon: L.divIcon({
                className: "distance",
                html: `<div><p>${guess ? haversineDistance.toFixed(2) + "km" : ""}</p></div>`,
            }),
        }).addTo(map);
        const answerMarker = L.marker(answer as LatLngExpression, {
            icon: answerIcon,
        }).addTo(map);

        let guessMarker = undefined;
        let line = undefined;

        if (guess) {
            guessMarker = L.marker(guess as LatLngExpression, {
                icon: guessIcon,
            }).addTo(map);
            const path: LatLngExpression[] = [
                guess as LatLngExpression,
                answer as LatLngExpression,
            ];
            line = L.polyline(path).addTo(map);
        }

        return () => {
            clearTimeout(fitDelay);
            map.removeLayer(distance);
            map.removeLayer(answerMarker);
            if (guessMarker) {
                map.removeLayer(guessMarker);
            }

            if (line) {
                map.removeLayer(line);
            }
        };
    }, [guess, answer, map, haversineDistance, isMobile]);

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
        gsap.set(".map, .info, .child", {
            opacity: 0,
        });
        gsap.to(".map", {
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            overwrite: "auto",
        });

        gsap.set(".info .child", {
            opacity: 0,
        });
        const infoChildrenTween = gsap.to(".info .child", {
            opacity: 1,
            duration: 2,
            delay: 1,
            stagger: 0.1,
            ease: "power2.out",
        });

        if (isMobile) {
            gsap.set(".info", {
                opacity: 1,
                top: "0",
            });
            setIsOpening(false);
        } else {
            gsap.set(".info", {
                opacity: 0,
                top: `calc(1.5 * ${Theme.spacing_1})`,
            });
            gsap.to(".info", {
                opacity: 1,
                top: Theme.spacing_1,
                delay: infoChildrenTween.delay(),
                duration: infoChildrenTween.duration() / 2,
                ease: "sine.inout",
                overwrite: "auto",
                onComplete: () => {
                    setIsOpening(false);
                },
            });
        }

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 800);
        };
        window.addEventListener("load", handleResize);
        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("load", handleResize);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useGSAP(
        () => {
            if (isMobile) {
                gsap.set(".info", {
                    top: "0",
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
                overwrite: "auto",
            }).to(".info, .map", {
                opacity: 0,
                stagger: 0.25,
                duration: 0.5,
                ease: "power2.out",
                overwrite: "auto",
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
                zoom={15}
                scrollWheelZoom={true}
                attributionControl={false}
                className="map"
                worldCopyJump={false}
                maxBounds={WorldBounds}
                maxBoundsViscosity={1}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {guess === undefined ? (
                    <Marker
                        position={answer.latlng as LatLngExpression}
                        icon={answerIcon}
                    />
                ) : null}
                <ResultsMapController
                    guess={guess}
                    answer={answer.latlng}
                    haversineDistance={haversineDistance}
                    isMobile={isMobile}
                />
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
