import "../styles/Home.scss";
import Parliament from "/Parliament.webp";
import { BsCameraFill } from "react-icons/bs";
import { FaCanadianMapleLeaf } from "react-icons/fa";
import PushButton from "../components/PushButton";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import { TabID } from "../enums/Tab";
import type { HomeTabAttributes } from "../global/Tab";
export default function Home({
    currentTab = TabID.None,
    onPlay = () => {},
}: HomeTabAttributes) {
    const homeRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLImageElement>(null);
    const [playDebounce, setPlayDebounce] = useState(false);

    useGSAP(() => {
        gsap.to(backgroundRef.current, {
            scale: 1,
            opacity: 0.1,
            duration: 2,
            ease: "power2.out",
            overwrite: "auto",
        });
    }, [backgroundRef]);

    const handlePlay = () => {
        if (playDebounce) {
            return;
        }
        setPlayDebounce(true);

        const onPlayFinish = () => {
            setPlayDebounce(false);
            onPlay();
        };

        gsap.to(homeRef.current, {
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            overwrite: "auto",
            onComplete: onPlayFinish,
        });
    };

    return (
        <div className="home" ref={homeRef}>
            <img
                ref={backgroundRef}
                className="background"
                src={Parliament}
                draggable={false}
            />
            <div className="title">
                <h1>Ot</h1>
                <h1 className="white">t</h1>
                <h1>
                    <FaCanadianMapleLeaf color="#fc8282" className="leaf" />
                </h1>
                <h1 className="white">w</h1>
                <h1>a Street</h1>
                <h1 className="white">Guessr</h1>
            </div>
            <p>How well do you know the streets of Ottawa?</p>
            <PlayWidget
                onClick={handlePlay}
                disabled={currentTab != TabID.Home}
            />
        </div>
    );
}

function PlayWidget({ onClick, disabled = false }: PushButtonAttributes) {
    return (
        <PushButton onClick={onClick} disabled={disabled}>
            <div className="icon">
                <BsCameraFill color="#ffffff" />
            </div>
        </PushButton>
    );
}
