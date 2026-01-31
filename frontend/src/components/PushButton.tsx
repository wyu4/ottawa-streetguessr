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
}: ButtonAttributes) {
    const playButtonRef = useRef<HTMLButtonElement>(null);
    const [hovering, setHovering] = useState(false);
    const [down, setDown] = useState(false);

    useGSAP(() => {
        if (hovering) {
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
    return (
        <button
            className={className}
            ref={playButtonRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
        >
            {children}
        </button>
    );
}
