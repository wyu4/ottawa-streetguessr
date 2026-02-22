import { RiResetLeftFill } from "react-icons/ri";
import PushButton from "./PushButton";
import Widget from "./Widget";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import type { LatLngExpression } from "leaflet";
import { LuClipboardCheck } from "react-icons/lu";
import gsap from "gsap";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { formatTime } from "../utils/TimeUtils";
import { VscDebugDisconnect } from "react-icons/vsc";
import "./../styles/Gameplay.scss";

const markerIcon = new L.Icon({
    iconUrl: "/Marker.webp",
    iconSize: [41, 41],
});

function GameplayMapController({
    zoom = 7,
    center = [45.2501659, -76.1298876],
    lastReset = 0,
    onSelection = () => {},
}: GameplayMapAttributes) {
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
        map.setView(center as LatLngExpression, zoom);
    }, [lastReset, map]);

    return null;
}

const Gameplay = ({
    className = "",
    onGuess = () => {},
}: GameplayAttributes) => {
    const defaultCenter: LatLngExpression = [
        45.40616374516014, -75.69580078125001,
    ];
    const defaultZoom = 8;
    const gameLength = 2 * 60;

    const WebsocketUrl = import.meta.env.VITE_Websocket_Url;
    const LocalWebsocketUrl = "http://localhost:3000";
    const websocketRef = useRef<WebSocket>(null);
    const gameplayRef = useRef<HTMLDivElement>(null);
    const selectionRef = useRef<number[] | undefined>(undefined);

    const sourceType = useRef<string>("image/webp");
    const [connectionAttempt, setConnectionAttempt] = useState(0);
    const [connectionFailed, setConnectionFailed] = useState(false);
    const [connected, setConnected] = useState(false);
    const [started, setStarted] = useState(false);
    const [source, setSource] = useState<string | undefined>(undefined);
    const [loaded, setLoaded] = useState(false);
    const [time, setTime] = useState(0);
    const [startTime, setStartTime] = useState(-1);
    const [lastReset, setLastReset] = useState(0);
    const [sourceIsValid, setSourceIsValid] = useState(true);
    const [isHoveringMap, setIsHoveringMap] = useState(false);
    const [isGuessing, setIsGuessing] = useState(false);
    const [markerPosition, setMarkerPosition] =
        useState<LatLngExpression | null>(null);

    const handleReset = () => {
        setLastReset(Date.now());
    };

    const handleCancelSkip = () => {
        setSourceIsValid(true);
    };

    const handleSkip = () => {
        setSourceIsValid(true);
        setStarted(false);
    };

    const handleMouseEnter = () => {
        setIsHoveringMap(true);
    };

    const handleMouseLeave = () => {
        setIsHoveringMap(false);
    };

    const handleSelect = (lat: number, lng: number) => {
        selectionRef.current = [lat, lng];
        setMarkerPosition([lat, lng]);
    };

    const sendGuess = () => {
        if (websocketRef.current == null) return;
        setIsGuessing(true);
        setTimeout(() => {
            websocketRef.current!.send(JSON.stringify({ type: "guess" }));
        }, 1000);
    };

    const handleSubmit = () => {
        if (selectionRef.current === undefined) {
            return;
        }
        sendGuess();
    };

    const getCurrentTime = () => Math.floor(Date.now() / 1000);

    useGSAP(() => {
        let closeId: number | undefined = undefined;

        const socket = new WebSocket(
            WebsocketUrl == null ? LocalWebsocketUrl : WebsocketUrl,
        );
        websocketRef.current = socket;

        socket.binaryType = "arraybuffer";

        const sendMessage = (json: GamePayload) => {
            socket.send(JSON.stringify(json));
        };

        socket.onopen = () => {
            setSource(undefined);
            setLoaded(false);
            setStartTime(-1);
            setIsGuessing(false);

            setConnected(true);
            sendMessage({
                type: "start",
            });
        };

        socket.onmessage = (message) => {
            if (typeof message.data === "string") {
                const parsed: GameResponsePayload = JSON.parse(message.data);
                if (parsed.success !== true) {
                    console.error(parsed.message);
                    return;
                }
                if (parsed.type === "feed") {
                    if (parsed.message == "invalid") {
                        setSourceIsValid(false);
                        return;
                    }
                    setSourceIsValid(true);
                    sourceType.current = parsed.content!;
                } else if (parsed.type === "game") {
                    setConnectionFailed(false);
                    setStarted(true);
                } else if (parsed.type === "guess") {
                    if (parsed.answer === undefined) return;
                    gsap.to(".loading", {
                        opacity: 0,
                        duration: 1,
                        ease: "sine.inOut",
                        overwrite: "auto",
                        onComplete: () => {
                            onGuess(selectionRef.current, {
                                name: parsed.message!,
                                latlng: parsed.answer!,
                            });
                        },
                    });
                }
            } else {
                const blob = new Blob([message.data], {
                    type: sourceType.current,
                });
                console.log("Blob size:", blob.size, "bytes");
                setSource(URL.createObjectURL(blob));
            }
        };

        socket.onclose = () => {
            setConnected(false);
            setStarted(false);
            setMarkerPosition(null);
            closeId = setTimeout(() => {
                setConnectionFailed(true);
            }, 1000);
            console.log("Lost connection...");
        };

        socket.onerror = (err) => {
            console.error(err);
        };

        return () => {
            clearTimeout(closeId);
            socket.close();
            websocketRef.current = null;
        };
    }, [WebsocketUrl, connectionAttempt]);

    useEffect(() => {
        if (!connectionFailed) return;
        const connectionAttemptID = setInterval(() => {
            if (!connectionFailed) return;
            setConnectionAttempt((prev) => prev + 1);
        }, 5000);

        return () => {
            clearInterval(connectionAttemptID);
        };
    }, [connectionFailed]);

    // Send data feed requests when started
    useEffect(() => {
        if (websocketRef.current == null || !connected) return;

        const socket = websocketRef.current;
        const sendMessage = (json: GamePayload) => {
            socket.send(JSON.stringify(json));
        };

        if (!started) {
            sendMessage({ type: "roll" });
            return;
        }

        const refresh = () => {
            if (!sourceIsValid) return;
            sendMessage({ type: "feed" });
        };
        refresh();

        const refreshInterval = setInterval(refresh, 20000);

        return () => {
            clearInterval(refreshInterval);
        };
    }, [connected, sourceIsValid, started]);

    // Timer
    useEffect(() => {
        if (startTime < 0 || !connected || isGuessing) return;

        const refresh = () => {
            const newTime = gameLength - (getCurrentTime() - startTime);
            if (newTime < 0) {
                sendGuess();
                return;
            }
            setTime(newTime);
        };
        refresh();

        const refreshInterval = setInterval(refresh, 1000);

        return () => {
            clearInterval(refreshInterval);
        };
    }, [gameLength, startTime, connected, isGuessing]);

    // Set all intitial GSAP states
    useGSAP(
        () => {
            gsap.set(".interface", {
                opacity: 0,
            });
            gsap.to(".interface", {
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                overwrite: "auto",
            });
            gsap.to(".loading", {
                rotation: "+=360cw",
                duration: 0.75,
                repeat: -1,
                ease: "none",
            });
            gsap.set(".skip", {
                translateY: "-100%",
                opacity: 0,
            });
            gsap.set(".map-widget", {
                opacity: 0.5,
            });
            gsap.set(".errors", {
                opacity: 0,
            });
            gsap.set(".error-widget", {
                translateY: "100%",
                opacity: 0,
            });

            return;
        },
        { dependencies: [], scope: gameplayRef },
    );

    useGSAP(
        () => {
            if (connectionFailed) {
                gsap.to(".errors", {
                    opacity: 1,
                    duration: 1,
                    pointerEvents: "all",
                    ease: "power2.out",
                    overwrite: "auto",
                });
                gsap.to(".disconnected", {
                    translateY: 0,
                    opacity: 1,
                    ease: "power2.out",
                    overwrite: "auto",
                    delay: 0.5,
                });
                return;
            }
            gsap.to(".errors", {
                opacity: 0,
                duration: 1,
                pointerEvents: "none",
                ease: "power2.out",
                overwrite: "auto",
                delay: 0.5,
            });
            gsap.to(".disconnected", {
                translateY: "100%",
                opacity: 0,
                ease: "power2.out",
                overwrite: "auto",
            });
        },
        { dependencies: [connectionFailed], scope: gameplayRef },
    );

    useGSAP(
        () => {
            if (!loaded) {
                gsap.set(".feed", {
                    opacity: 0,
                });
                return;
            }
            setStartTime(getCurrentTime);
            gsap.to(".feed", {
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                overwrite: "auto",
            });
        },
        { dependencies: [loaded], scope: gameplayRef },
    );

    useGSAP(
        () => {
            if (sourceIsValid) {
                gsap.to(".skip", {
                    translateY: "-100%",
                    opacity: 0,
                    duration: 1,
                    ease: "power2.out",
                    overwrite: "auto",
                });
                return;
            }
            gsap.to(".skip", {
                translateY: 0,
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                overwrite: "auto",
            });
        },
        { dependencies: [sourceIsValid], scope: gameplayRef },
    );

    useGSAP(
        () => {
            if (isGuessing) return;
            if (isHoveringMap) {
                gsap.to(".map-widget", {
                    opacity: 1,
                    duration: 0.25,
                    ease: "power2.out",
                    overwrite: "auto",
                });
                return;
            }
            gsap.to(".map-widget", {
                opacity: 0.5,
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto",
            });
        },
        { dependencies: [isHoveringMap, isGuessing], scope: gameplayRef },
    );

    useGSAP(
        () => {
            if (isGuessing) {
                gsap.to(".side", {
                    opacity: 0,
                    duration: 1,
                    ease: "sine.inOut",
                    overwrite: "auto",
                });
                gsap.to(".map-widget", {
                    translateY: "50%",
                    duration: 1,
                    ease: "sine.inOut",
                    overwrite: "auto",
                });
                gsap.to(".feed", {
                    opacity: 0,
                    duration: 1,
                    ease: "sine.inOut",
                    overwrite: "auto",
                });
                return;
            }
            gsap.to(".side", {
                opacity: 1,
                duration: 1,
                ease: "sine.inOut",
                overwrite: "auto",
            });
            gsap.to(".map-widget", {
                translateY: 0,
                duration: 1,
                ease: "sine.inOut",
                overwrite: "auto",
            });
            gsap.to(".feed", {
                opacity: 1,
                duration: 1,
                ease: "sine.inOut",
                overwrite: "auto",
            });
        },
        { dependencies: [isGuessing], scope: gameplayRef },
    );

    const handleLoad = () => {
        setLoaded(true);
    };

    return (
        <div ref={gameplayRef} className={`gameplay ${className}`}>
            <div className="loading">
                <AiOutlineLoading3Quarters color="#bbbbbb" />
            </div>
            <div className="feed">
                <img src={source} draggable={false} onLoad={handleLoad} />
            </div>
            <div className="interface">
                <div className="errors">
                    <Widget
                        hidden={!connectionFailed}
                        className="error-widget disconnected"
                    >
                        <h2>Connection lost</h2>
                        <VscDebugDisconnect color="white" size={"3em"} />
                        <p>
                            Could not connect to the server. Please check your
                            internet connection.
                        </p>
                    </Widget>
                </div>
                <div className="top">
                    <div className="timer">
                        <p>{formatTime(time)}</p>
                    </div>
                    <div className="skip">
                        <p>Something might be wrong with the feed. Skip?</p>
                        <div>
                            <PushButton
                                disabled={sourceIsValid}
                                onClick={handleCancelSkip}
                            >
                                <FaXmark color="#ffffff" />
                            </PushButton>
                            <PushButton
                                disabled={sourceIsValid}
                                onClick={handleSkip}
                            >
                                <FaCheck color="#ffffff" />
                            </PushButton>
                        </div>
                    </div>
                </div>
                <div className="side">
                    <Widget
                        className="map-widget"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <MapContainer
                            zoom={defaultZoom}
                            center={defaultCenter}
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

                            {markerPosition == null ? null : (
                                <Marker
                                    position={markerPosition}
                                    icon={markerIcon}
                                ></Marker>
                            )}

                            <GameplayMapController
                                zoom={defaultZoom}
                                center={defaultCenter as number[]}
                                onSelection={handleSelect}
                                lastReset={lastReset}
                            />
                        </MapContainer>
                        <div className="controls">
                            <PushButton className="reset" onClick={handleReset}>
                                <RiResetLeftFill color="#ffffff" />
                            </PushButton>
                            <PushButton
                                className="submit"
                                onClick={handleSubmit}
                                disabled={!started}
                            >
                                <LuClipboardCheck color="#ffffff" />
                            </PushButton>
                        </div>
                    </Widget>
                </div>
            </div>
        </div>
    );
};

export default Gameplay;
