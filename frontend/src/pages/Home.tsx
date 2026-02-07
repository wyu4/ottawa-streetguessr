import "../styles/Home.scss";
import Parliament from "/Parliament.webp";
import { BsCameraFill } from "react-icons/bs";
import { FaCanadianMapleLeaf } from "react-icons/fa";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { forwardRef, useRef, useState } from "react";
import { SplitText } from "gsap/all";
import PushButton from "../components/PushButton";

export default function Home({ onPlay = () => {} }: HomeTabAttributes) {
    const homeRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLImageElement>(null);
    const titleRefs = useRef<HTMLDivElement[]>([]);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const playRef = useRef<HTMLButtonElement>(null);
    const creditRef = useRef<HTMLParagraphElement>(null);
    const [playDebounce, setPlayDebounce] = useState(false);

    useGSAP(() => {
        const subtitleText = new SplitText(subtitleRef.current, {
            type: "words",
        });

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

        gsap.set(titleRefs.current, {
            translateY: "-100%",
            opacity: 0,
        });
        gsap.to(titleRefs.current, {
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
        });

        gsap.set(creditRef.current, {
            opacity: 0,
        });
        gsap.to(creditRef.current, {
            opacity: 0.75,
            duration: 3,
            delay: 2,
            ease: "power2.out",
            overwrite: "auto",
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
            <p className="credit" ref={creditRef}>
                Photo by{" "}
                <a href="https://unsplash.com/@aleks_g?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
                    Aleksandr Galenko
                </a>{" "}
                on{" "}
                <a href="https://unsplash.com/photos/a-large-building-with-a-clock-tower-on-top-of-it-jdEscvHbmts?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">
                    Unsplash
                </a>
            </p>
            <div className="title">
                <div
                    ref={(node) => {
                        titleRefs.current[0] = node!;
                    }}
                >
                    <h1>Ot</h1>
                    <h1 className="white">t</h1>
                    <h1>
                        <FaCanadianMapleLeaf color="#fc8282" className="leaf" />
                    </h1>
                    <h1 className="white">w</h1>
                    <h1>a</h1>
                </div>
                <div
                    ref={(node) => {
                        titleRefs.current[1] = node!;
                    }}
                >
                    <h1> Street</h1>
                    <h1 className="white">Guessr</h1>
                </div>
            </div>
            <h2 ref={subtitleRef}>
                How well do you know the streets of Ottawa?
            </h2>
            <PlayWidget onClick={handlePlay} ref={playRef} />
        </div>
    );
}

const PlayWidget = forwardRef<HTMLButtonElement, PushButtonAttributes>(
    ({ onClick, disabled = false }, ref) => {
        return (
            <PushButton ref={ref} onClick={onClick} disabled={disabled}>
                <div className="icon">
                    <BsCameraFill color="#ffffff" />
                </div>
            </PushButton>
        );
    },
);
