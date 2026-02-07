import { forwardRef, useRef, useState } from "react";

import { FaCheck } from "react-icons/fa";
import PushButton from "./PushButton";
import "./../styles/Guide.scss";
import Clock from "./Clock";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { useGSAP } from "@gsap/react";

const Guide = forwardRef<HTMLDivElement, GuideAttributes>(
    ({ className = "", onAccept = () => {}, ...props }, ref) => {
        const [acceptDisabled, setAcceptDisabled] = useState(true);
        const [debounce, setDebounce] = useState(false);
        const titleRef = useRef<HTMLHeadingElement>(null);
        const paragraphRef = useRef<HTMLParagraphElement[]>([]);
        const timeRef = useRef<HTMLDivElement>(null);
        const acceptRef = useRef<HTMLButtonElement>(null);

        useGSAP(() => {
            const paragraphText = new SplitText(paragraphRef.current, {
                type: "words",
            });

            gsap.set(titleRef.current, {
                scale: 0.8,
                opacity: 0,
            });
            gsap.to(titleRef.current, {
                scale: 1,
                opacity: 1,
                duration: 2,
                delay: 0.5,
                ease: "back.out",
                overwrite: "auto",
            });

            gsap.set(timeRef.current, {
                opacity: 0,
            });
            gsap.set(acceptRef.current, {
                opacity: 0,
            });

            gsap.set(paragraphText.words, {
                translateY: "1em",
                opacity: 0,
            });
            gsap.to(paragraphText.words, {
                translateY: 0,
                opacity: 1,
                duration: 1,
                delay: 1.5,
                stagger: 0.1,
                ease: "back.out",
                overwrite: "auto",
                onComplete: () => {
                    setAcceptDisabled(false);
                    gsap.to(timeRef.current, {
                        opacity: 0.75,
                        duration: 2,
                        delay: 0.5,
                        ease: "back.out",
                        overwrite: "auto",
                    });
                    gsap.to(acceptRef.current, {
                        opacity: 1,
                        duration: 2,
                        delay: 1,
                        ease: "sine.out",
                        overwrite: "auto",
                    });
                },
            });
        });

        useGSAP(() => {
            if (!debounce) return;
            gsap.to(
                [
                    titleRef.current,
                    ...paragraphRef.current,
                    timeRef.current,
                    acceptRef.current,
                ],
                {
                    opacity: 0,
                    duration: 0.5,
                    stagger: {
                        each: 0.25,
                        from: "random",
                    },
                    ease: "sine.out",
                    overwrite: "auto",
                    onComplete: () => {
                        onAccept();
                    },
                },
            );
        }, [debounce]);

        const handleAccept = () => {
            if (debounce) return;
            setDebounce(true);
        };

        return (
            <div ref={ref} className={`guide ${className}`} {...props}>
                <h2 ref={titleRef}>Instructions</h2>
                <p
                    ref={(node) => {
                        paragraphRef.current[0] = node!;
                    }}
                >
                    You will be shown a <b>live feed</b> of a random street in
                    the capital of Canada.
                </p>
                <p
                    ref={(node) => {
                        paragraphRef.current[1] = node!;
                    }}
                >
                    You have <b>2 minutes</b> to locate the feed on a map.
                </p>
                <div className="clock-container" ref={timeRef}>
                    <p>The time in Ottawa right now is</p>
                    <b>
                        <Clock />
                    </b>
                </div>
                <PushButton
                    ref={acceptRef}
                    onClick={handleAccept}
                    disabled={acceptDisabled}
                >
                    <FaCheck color="#ffffff" />
                </PushButton>
            </div>
        );
    },
);

export default Guide;
