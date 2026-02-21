import "../styles/Home.scss";
import Parliament from "/Parliament.webp";
import { BsCameraFill } from "react-icons/bs";
import { FaCanadianMapleLeaf } from "react-icons/fa";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useEffect, useRef, useState } from "react";
import { SplitText } from "gsap/all";
import PushButton from "../components/PushButton";
import { FaGithub } from "react-icons/fa";
import { FaQuestion } from "react-icons/fa6";
import AboutWidget from "../components/AboutWidget";
import About from "./About";

export default function Home({ onPlay = () => {} }: HomeTabAttributes) {
    const homeRef = useRef<HTMLDivElement>(null);
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);
    const [playDebounce, setPlayDebounce] = useState(false);
    const [viewingAbout, setViewingAbout] = useState(false);

    // Skip trying to load background if it takes longer than a second
    useEffect(() => {
        if (backgroundLoaded) return;
        const loadId = setTimeout(() => {
            console.log("Background load timeout: Skipping to animation.");
            setBackgroundLoaded(true);
        }, 1000);
        return () => {
            clearTimeout(loadId);
        };
    }, [backgroundLoaded]);

    useGSAP(
        () => {
            const subtitleText = new SplitText("h2", {
                type: "words",
            });
            gsap.set(".background", {
                scale: 1.4,
            });

            gsap.set("h1", {
                translateY: "-100%",
                opacity: 0,
            });

            gsap.set(subtitleText.words, {
                translateY: "100%",
                opacity: 0,
            });

            gsap.set("button", {
                opacity: 0,
            });

            gsap.set(".credit", {
                opacity: 0,
            });

            if (!backgroundLoaded) return;

            gsap.to(".background", {
                scale: 1,
                opacity: 0.1,
                duration: 2,
                ease: "power2.out",
                overwrite: "auto",
            });

            gsap.to("h1", {
                translateY: 0,
                opacity: 1,
                duration: 2,
                stagger: 0.25,
                ease: "power2.out",
                overwrite: "auto",
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

            gsap.to("button", {
                opacity: 1,
                duration: 2,
                delay: 2,
                stagger: 0.25,
                ease: "power2.out",
            });

            gsap.to(".credit", {
                opacity: 0.75,
                duration: 3,
                delay: 2,
                ease: "power2.out",
                overwrite: "auto",
            });
        },
        { dependencies: [backgroundLoaded], scope: homeRef },
    );

    const handleBackgroundLoaded = () => {
        setBackgroundLoaded(true);
    };

    const handlePlay = () => {
        if (playDebounce) return;
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

    const handleGithub = () => {
        window.open(
            "https://github.com/wyu4/ottawa-streetguessr.git",
            "_blank",
        );
    };

    const handleAbout = () => {
        setViewingAbout(true);
    };

    const handleCloseAbout = () => {
        setViewingAbout(false);
    };

    return (
        <div className="home" ref={homeRef}>
            <img
                className="background"
                src={Parliament}
                onLoad={handleBackgroundLoaded}
                draggable={false}
            />
            <p className="credit">
                Photo by{" "}
                <a
                    href="https://unsplash.com/@aleks_g?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
                    target="_blank"
                >
                    Aleksandr Galenko
                </a>{" "}
                on{" "}
                <a
                    href="https://unsplash.com/photos/a-large-building-with-a-clock-tower-on-top-of-it-jdEscvHbmts?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
                    target="_blank"
                >
                    Unsplash
                </a>
            </p>
            <div className="title">
                <div>
                    <h1>Ot</h1>
                    <h1 className="white">t</h1>
                    <h1>
                        <FaCanadianMapleLeaf color="#fc8282" className="leaf" />
                    </h1>
                    <h1 className="white">w</h1>
                    <h1>a</h1>
                </div>
                <div>
                    <h1> Street</h1>
                    <h1 className="white">Guessr</h1>
                </div>
            </div>
            <h2>How well do you know the streets of Ottawa?</h2>
            <PushButton onClick={handlePlay} disabled={playDebounce}>
                <BsCameraFill color="#ffffff" />
            </PushButton>
            <div className="misc">
                <PushButton onClick={handleGithub}>
                    <FaGithub color="#ffffff" />
                </PushButton>
                <PushButton onClick={handleAbout}>
                    <FaQuestion color="#ffffff" />
                </PushButton>
            </div>
            {viewingAbout ? <HomeAbout onAgree={handleCloseAbout} /> : null}
        </div>
    );
}

const HomeAbout = ({ onAgree = () => {}, ...props }: AboutTabAttributes) => {
    const [viewing, setViewing] = useState(true);
    const aboutRef = useRef<HTMLDivElement>(null);

    const handleAgree = () => {
        setViewing(false);
    };

    useGSAP(
        () => {
            if (viewing) {
                gsap.set(aboutRef.current, {
                    opacity: 0,
                });
                gsap.to(aboutRef.current, {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.out",
                });
                return;
            }
            const tween = gsap.to(aboutRef.current, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.out",
            });

            const tweenId = setTimeout(onAgree, tween.duration());

            return () => {
                clearTimeout(tweenId);
            };
        },
        [viewing],
    );
    return <About ref={aboutRef} onAgree={handleAgree} {...props} />;
};
