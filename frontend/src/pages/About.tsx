import "../styles/Home.scss";
import { forwardRef, useRef, useState } from "react";
import AboutWidget from "../components/AboutWidget";
import "./../styles/About.scss";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const About = forwardRef<HTMLDivElement, AboutTabAttributes>(
    ({ onAgree = () => {} }, forwardedRef) => {
        const aboutRef = useRef<HTMLDivElement>(null);
        const [leaving, setLeaving] = useState(false);

        const handleAgree = () => {
            setLeaving(true);
        };

        useGSAP(() => {
            if (!leaving) return;
            const aboutTween = gsap.to(aboutRef.current, {
                opacity: 0,
                duration: 0.5,
                ease: "power2.out",
            });

            const agreeId = setTimeout(onAgree, aboutTween.duration() * 1000);

            return () => {
                clearTimeout(agreeId);
            };
        }, [leaving]);

        return (
            <div
                className="about"
                ref={(node) => {
                    aboutRef.current = node;
                    if (forwardedRef) {
                        if (typeof forwardedRef === "function")
                            forwardedRef(node);
                        else forwardedRef.current = node;
                    }
                }}
            >
                <AboutWidget onAgree={handleAgree} />
            </div>
        );
    },
);

export default About;
