import "../styles/Home.scss";
import Parliament from "/Parliament.webp";
import { BsCameraFill } from "react-icons/bs";
import { FaCanadianMapleLeaf } from "react-icons/fa";
import PushButton from "../components/PushButton";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
export default function Home() {
    const backgroundRef = useRef<HTMLImageElement>(null);

    useGSAP(() => {
        gsap.to(backgroundRef.current, {
            scale: 1,
            opacity: 0.1,
            duration: 2,
            ease: "power2.out",
            overwrite: "auto",
        });
    }, [backgroundRef]);

    return (
        <div className="home">
            <img
                ref={backgroundRef}
                className="background"
                src={Parliament}
                draggable={false}
            />
            <div className="title">
                <h1>Ot</h1>
                <h1 className="white">t</h1>
                <h1><FaCanadianMapleLeaf color="#fc8282" className="leaf" /></h1>
                <h1 className="white">w</h1><h1>a Street</h1><h1 className="white">Guessr</h1>
            </div>
            <p>How well do you know the streets of Ottawa?</p>
            <PlayWidget />
        </div>
    );
}

function PlayWidget() {
    return (
        <PushButton>
            <div className="icon">
                <BsCameraFill color="#ffffff" />
            </div>
        </PushButton>
    );
}
