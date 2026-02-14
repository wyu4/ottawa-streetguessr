import { RiResetLeftFill } from "react-icons/ri";
import PushButton from "./PushButton";
import SelectableMap from "./SelectableMap";
import Widget from "./Widget";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import type { LatLngExpression } from "leaflet";
import { LuClipboardCheck } from "react-icons/lu";
import gsap from "gsap";
import "./../styles/Gameplay.scss";
import { formatTime } from "../utils/TimeUtils";

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
    const [connected, setConnected] = useState(false);
    const [started, setStarted] = useState(false);
    const [startTime, setStartTime] = useState(-1);
    const [source, setSource] = useState<string | undefined>(undefined);
    const [loaded, setLoaded] = useState(false);
    const [time, setTime] = useState(0);
    const [lastReset, setLastReset] = useState(0);
    const [sourceIsValid, setSourceIsValid] = useState(true);
    const [isHoveringMap, setIsHoveringMap] = useState(false);

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
    };

    const sendGuess = () => {
        if (websocketRef.current == null) return;
        websocketRef.current.send(JSON.stringify({ type: "guess" }));
    };

    const handleSubmit = () => {
        if (selectionRef.current === undefined) {
            return;
        }
        sendGuess();
    };

    const getCurrentTime = () => Math.floor(Date.now() / 1000);

    useEffect(() => {
        const socket = new WebSocket(
            WebsocketUrl == null ? LocalWebsocketUrl : WebsocketUrl,
        );
        websocketRef.current = socket;

        socket.binaryType = "arraybuffer";

        const sendMessage = (json: GamePayload) => {
            socket.send(JSON.stringify(json));
        };

        socket.onopen = () => {
            setConnected(true);
            sendMessage({
                type: "start",
            });
        };

        socket.onmessage = (message) => {
            if (typeof message.data === "string") {
                const parsed: GameResponsePayload = JSON.parse(message.data);
                if (parsed.success !== true) {
                    console.error(message.data);
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
                    setStarted(true);
                    setStartTime(getCurrentTime);
                } else if (parsed.type === "guess") {
                    if (parsed.answer === undefined) return;
                    onGuess(selectionRef.current, {
                        name: parsed.message,
                        latlng: parsed.answer,
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
            console.log("Lost connection...");
        };

        socket.onerror = (err) => {
            console.error(err);
        };

        return () => {
            socket.close();
            websocketRef.current = null;
        };
    }, [WebsocketUrl, onGuess]);

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

    useEffect(() => {
        if (startTime < 0) return;

        const refresh = () => {
            if (!started) return;
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
    }, [gameLength, startTime, started]);

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
            gsap.set(".map", {
                opacity: 0.5,
            });
            return;
        },
        { dependencies: [], scope: gameplayRef },
    );

    useGSAP(
        () => {
            if (!loaded) {
                gsap.set(".feed", {
                    opacity: 0,
                });
                return;
            }
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
            if (isHoveringMap) {
                gsap.to(".map", {
                    opacity: 1,
                    duration: 0.25,
                    ease: "power2.out",
                    overwrite: "auto",
                });
                return;
            }
            gsap.to(".map", {
                opacity: 0.5,
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto",
            });
        },
        { dependencies: [isHoveringMap], scope: gameplayRef },
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
                        className="map"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <SelectableMap
                            zoom={defaultZoom}
                            center={defaultCenter}
                            lastReset={lastReset}
                            selectionEnabled={true}
                            onSelection={handleSelect}
                        />
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
