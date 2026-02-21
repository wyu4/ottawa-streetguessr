import { useState } from "react";
import Guide from "../components/Guide";
import "./../styles/Game.scss";
import Gameplay from "../components/Gameplay";
import Results from "../components/Results";

export default function Game({ onHome = () => {} }: GameTabAttributes) {
    const [gameState, setGameState] = useState(0);

    const [answer, setAnswer] = useState<ResultsAttributes | undefined>(
        undefined,
    );

    const handleGuideAccept = () => {
        setAnswer(undefined);
        setGameState(1);
    };

    const handleRestart = () => {
        if (answer === undefined) return;
        setGameState(1);
    };

    const handleGuess = (
        newGuess: number[] | undefined,
        newAnswer: GameAnswerPayload,
    ) => {
        setAnswer({
            guess: newGuess,
            answer: newAnswer,
            onReset: () => setGameState(0),
            onHome: onHome,
        });
    };

    return (
        <div className="game">
            {gameState === 0 ? (
                <Guide onAccept={handleGuideAccept} />
            ) : answer === undefined ? (
                <Gameplay onGuess={handleGuess} />
            ) : (
                <Results {...answer} />
            )}
        </div>
    );
}
