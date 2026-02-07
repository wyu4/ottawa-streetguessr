import { useState } from "react";
import Guide from "../components/Guide";
import "./../styles/Game.scss";

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
    return <div className={`gameplay ${className}`}></div>;
};
