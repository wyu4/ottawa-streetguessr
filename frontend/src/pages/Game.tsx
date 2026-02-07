import { useEffect, useRef, useState } from "react";
import Guide from "../components/Guide";
import "./../styles/Game.scss";
import SelectableMap from "../components/SelectableMap";
import Widget from "../components/Widget";

export default function Game({ onHome = () => {} }: GameTabAttributes) {
    const [guideEnabled, setGuideEnabled] = useState(true);

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
    const WebsocketUrl = import.meta.env.VITE_Websocket_Url;
    const LocalWebsocketUrl = "http://localhost:3000";
    const websocketRef = useRef<WebSocket>(null);

    const sourceType = useRef<string>("image/jpeg");
    const [started, setStarted] = useState(false);
    const [source, setSource] = useState<string | undefined>(undefined);

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
        if (!started || websocketRef.current == null) return;

        const socket = websocketRef.current;

        const sendMessage = (json: GamePayload) => {
            socket.send(JSON.stringify(json));
        };

        const refresh = () => {
            sendMessage({ type: "feed" });
        };
        refresh();

        const refreshInterval = setInterval(refresh, 20000);

        return () => {
            clearInterval(refreshInterval);
        };
    }, [started]);

    return (
        <div className={`gameplay ${className}`}>
            <div className="feed">
                <img src={source} draggable={false} />
            </div>
            <Widget className="map">
                <SelectableMap />
            </Widget>
        </div>
    );
};
