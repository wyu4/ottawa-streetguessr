import PushButton from "./PushButton";
import Widget from "./Widget";
import { FaCheck } from "react-icons/fa";
import "./../styles/About.scss";
import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

const AboutWidget = ({
    onAgree = () => {},
    className,
    ...props
}: AboutTabAttributes) => {
    const widgetRef = useRef<HTMLDivElement>(null);
    const [agreed, setAgreed] = useState(false);

    const handleAgree = () => {
        setAgreed(true);
    };

    useGSAP(
        () => {
            const paragraphText = new SplitText(".child", {
                type: "words",
            });
            if (!agreed) {
                gsap.set([paragraphText.words, "h2"], {
                    translateY: "1rem",
                    opacity: 0,
                });

                gsap.set("button", {
                    opacity: 0,
                });

                const bodytween = gsap.timeline();
                bodytween
                    .to(paragraphText.words, {
                        translateY: 0,
                        opacity: 1,
                        duration: 0.5,
                        delay: 0.5,
                        stagger: {
                            each: 0.05,
                            from: "start",
                        },
                        ease: "power2.out",
                        overwrite: "auto",
                    })
                    .to("button", {
                        opacity: 1,
                        duration: 1,
                        ease: "power2.out",
                        overwrite: "auto",
                    });

                gsap.to("h2", {
                    translateY: 0,
                    opacity: 1,
                    duration: bodytween.duration(),
                    ease: "power2.out",
                });
                return;
            }

            const bodytween = gsap.to([paragraphText.words, "button"], {
                translateY: "1rem",
                opacity: 0,
                duration: 0.5,
                stagger: {
                    each: 0.01,
                    from: "end",
                },
                ease: "power2.out",
            });
            gsap.to("h2", {
                translateY: "-1rem",
                opacity: 0,
                duration: bodytween.duration() / 3,
                ease: "power2.out",
            });

            const agreeId = setTimeout(onAgree, bodytween.duration() * 1000);

            return () => {
                clearTimeout(agreeId);
            };
        },
        { dependencies: [agreed], scope: widgetRef },
    );

    return (
        <Widget
            className={`about-widget ${className}`}
            {...props}
            ref={widgetRef}
        >
            <h2>About</h2>
            <p className="child">
                This is a GeoGuessr-inspired game that uses publicly available
                live traffic feeds from all over Ottawa, the capital of Canada.
                This is a very experimental project, and some feeds may not
                display very clearly.
            </p>
            <p className="child">
                Please note that this game was made primarily in consideration
                of locals who are familiar with the streets and intersections.
            </p>
            <p className="child">
                This note can be opened at any time through the home screen.
            </p>

            <PushButton onClick={handleAgree} disabled={agreed}>
                <FaCheck />
            </PushButton>
        </Widget>
    );
};

export default AboutWidget;
