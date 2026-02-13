import { useEffect, useRef, useState } from "react";
import Guide from "../components/Guide";
import "./../styles/Game.scss";
import type { LatLngExpression } from "leaflet";
import Gameplay from "../components/Gameplay";

export default function Game({ onHome = () => {} }: GameTabAttributes) {
    const [gameState, setGameState] = useState(0);
    const [guess, setGuess] = useState<LatLngExpression | undefined>(undefined);

    const handleGuideAccept = () => {
        setGameState(1);
    };

    const handleGuess = (guess: number[] | undefined) => {
        setGuess(guess as LatLngExpression | undefined);
        setGameState(2);
    };

    return (
        <div className="game">
            {gameState === 0 ? (
                <Guide onAccept={handleGuideAccept} />
            ) : gameState === 1 ? (
                <Gameplay onGuess={handleGuess} />
            ) : null}
        </div>
    );
}
