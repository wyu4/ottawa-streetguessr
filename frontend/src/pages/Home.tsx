import "../styles/Home.scss";
import Parliament from "/Parliament.webp";
import { BsCameraFill } from "react-icons/bs";
import { FaCanadianMapleLeaf } from "react-icons/fa";
import PushButton from "../components/PushButton";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useState, type Ref } from "react";
import { TabID } from "../enums/Tab";
import type { HomeTabAttributes } from "../global/Tab";
import { SplitText } from "gsap/all";

export default function Home({
    currentTab = TabID.None,
    onPlay = () => {},
}: HomeTabAttributes) {
    const homeRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLImageElement>(null);
    const titleRefs = [
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
    ];
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const playRef = useRef<HTMLButtonElement>(null);
    const [playDebounce, setPlayDebounce] = useState(true);

    useGSAP(() => {
        const subtitleText = new SplitText(subtitleRef.current, {
            type: "words",
        });
        const title = titleRefs.map((ref) => ref.current);

        gsap.set(backgroundRef.current, {
            scale: 1.4,
        });
        gsap.to(backgroundRef.current, {
            scale: 1,
            opacity: 0.1,
            duration: 2,
            ease: "power2.out",
            overwrite: "auto",
        });

        gsap.set(title, {
            translateY: "-100%",
            opacity: 0,
        });
        gsap.to(title, {
            translateY: 0,
            opacity: 1,
            duration: 2,
            stagger: 0.25,
            ease: "power2.out",
            overwrite: "auto",
        });

        gsap.set(subtitleText.words, {
            translateY: "100%",
            opacity: 0,
        });
        gsap.to(subtitleText.words, {
            translateY: 0,
            opacity: 1,
            duration: 2,
            stagger: {
                each: 0.05,
                from: "random",
            },
            delay: 1,
            ease: "power2.out",
            overwrite: "auto",
        });

        gsap.set(playRef.current, {
            opacity: 0,
        });
        gsap.to(playRef.current, {
            opacity: 1,
            duration: 2,
            delay: 2,
            ease: "power2.out",
            overwrite: "auto",
            onComplete: () => {
                setPlayDebounce(false);
            },
        });
    }, []);

    const handlePlay = () => {
        if (playDebounce) {
            return;
        }
        setPlayDebounce(true);
        gsap.to(homeRef.current, {
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            overwrite: "auto",
            onComplete: () => {
                setPlayDebounce(false);
                onPlay();
            },
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
                <div ref={titleRefs[0]}>
                    <h1>Ot</h1>
                    <h1 className="white">t</h1>
                    <h1>
                        <FaCanadianMapleLeaf color="#fc8282" className="leaf" />
                    </h1>
                    <h1 className="white">w</h1>
                    <h1>a</h1>
                </div>
                <div ref={titleRefs[1]}>
                    <h1> Street</h1>
                    <h1 className="white">Guessr</h1>
                </div>
            </div>
            <p ref={subtitleRef}>How well do you know the streets of Ottawa?</p>
            <PlayWidget
                onClick={handlePlay}
                disabled={currentTab != TabID.Home}
                ref={playRef}
            />
        </div>
    );
}

function PlayWidget({
    onClick,
    disabled = false,
    ref = null,
}: PushButtonAttributes) {
    return (
        <PushButton ref={ref} onClick={onClick} disabled={disabled}>
            <div className="icon">
                <BsCameraFill color="#ffffff" />
            </div>
        </PushButton>
    );
}
