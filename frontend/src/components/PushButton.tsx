import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";

export default function PushButton({
    children,
    className,
    onMouseUp,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onClick,
    disabled = false,
}: PushButtonAttributes) {
    const playButtonRef = useRef<HTMLButtonElement>(null);
    const [hovering, setHovering] = useState(false);
    const [down, setDown] = useState(false);
    const [cursor, setCursor] = useState("default");

    useGSAP(() => {
        if (hovering) {
            if (disabled) return;
            setCursor("pointer");
            if (down) {
                gsap.to(playButtonRef.current, {
                    scale: 0.9,
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: "auto",
                });
                return;
            }
            gsap.to(playButtonRef.current, {
                scale: 1.1,
                duration: 0.3,
                ease: "power2.out",
                overwrite: "auto",
            });
        } else {
            setCursor("default");
            gsap.to(playButtonRef.current, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
                overwrite: "auto",
            });
        }
    }, [hovering, down]);

    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
        setHovering(true);
        onMouseEnter?.(event);
    };

    const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
        setHovering(false);
        setDown(false);
        onMouseLeave?.(event);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
        setDown(true);
        onMouseDown?.(event);
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
        setDown(false);
        onMouseUp?.(event);
    };

    const handleMouseClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled) return;
        onClick?.(event);
    };

    return (
        <button
            className={className}
            ref={playButtonRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={handleMouseClick}
            style={{
                cursor: cursor,
            }}
        >
            {children}
        </button>
    );
}
