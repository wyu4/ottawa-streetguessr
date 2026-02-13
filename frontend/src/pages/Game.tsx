import { useEffect, useRef, useState } from "react";
import Guide from "../components/Guide";
import "./../styles/Game.scss";
import SelectableMap from "../components/SelectableMap";
import Widget from "../components/Widget";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import PushButton from "../components/PushButton";
import { LuClipboardCheck } from "react-icons/lu";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { RiResetLeftFill } from "react-icons/ri";
import type { LatLngExpression } from "leaflet";
import { FaCheck } from "react-icons/fa6";
import { FaXmark } from "react-icons/fa6";

export default function Game({ onHome = () => {} }: GameTabAttributes) {
    const [guideEnabled, setGuideEnabled] = useState(false);

    const handleGuideAccept = () => {
        setGuideEnabled(false);
    };

    return (
        <div className="game">
            {guideEnabled ? (
                <Guide onAccept={handleGuideAccept} />
            ) : (
                <Gameplay />
            )}
        </div>
    );
}

const Gameplay = ({ className = "" }: DivAttributes) => {
    const defaultCenter: LatLngExpression = [
        45.40616374516014, -75.69580078125001,
    ];
    const defaultZoom = 8;

    const WebsocketUrl = import.meta.env.VITE_Websocket_Url;
    const LocalWebsocketUrl = "http://localhost:3000";
    const websocketRef = useRef<WebSocket>(null);
    const gameplayRef = useRef<HTMLDivElement>(null);

    const sourceType = useRef<string>("image/webp");
    const [connected, setConnected] = useState(false);
    const [started, setStarted] = useState(false);
    const [source, setSource] = useState<string | undefined>(undefined);
    const [loaded, setLoaded] = useState(false);
    const [time, setTime] = useState(0);
    const [lastReset, setLastReset] = useState(0);
    const [sourceIsValid, setSourceIsValid] = useState(true);

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
    }, [WebsocketUrl]);

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
    }, [connected, started]);

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

    const handleLoad = () => {
        setLoaded(true);
    };

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        // Use String.padStart() to ensure two digits for seconds
        const formattedMinutes = String(minutes).padStart(1, "0");
        const formattedSeconds = String(seconds).padStart(2, "0");

        return `${formattedMinutes}:${formattedSeconds}`;
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
                    <Widget className="map">
                        <SelectableMap
                            zoom={defaultZoom}
                            center={defaultCenter}
                            lastReset={lastReset}
                            selectionEnabled={true}
                        />
                        <div className="controls">
                            <PushButton className="reset" onClick={handleReset}>
                                <RiResetLeftFill color="#ffffff" />
                            </PushButton>
                            <PushButton className="submit">
                                <LuClipboardCheck color="#ffffff" />
                            </PushButton>
                        </div>
                    </Widget>
                </div>
            </div>
        </div>
    );
};
