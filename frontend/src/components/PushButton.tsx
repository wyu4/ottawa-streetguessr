import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { forwardRef, useRef, useState } from "react";
import Theme from "./../styles/Theme.module.scss";

const PushButton = forwardRef<HTMLButtonElement, PushButtonAttributes>(
    (
        {
            children,
            className,
            onMouseUp,
            onMouseDown,
            onMouseEnter,
            onMouseLeave,
            onClick,
            disabled = false,
            style = {},
            ...props
        },
        forwardedRef,
    ) => {
        const buttonRef = useRef<HTMLButtonElement>(null);
        const [hovering, setHovering] = useState(false);
        const [down, setDown] = useState(false);
        const [cursor, setCursor] = useState("default");

        useGSAP(() => {
            if (hovering) {
                if (disabled) return;
                setCursor("pointer");
                if (down) {
                    gsap.to(buttonRef.current, {
                        scale: 0.9,
                        duration: 0.3,
                        ease: "power2.out",
                        borderColor: Theme.border_1,
                        overwrite: "auto",
                    });
                    return;
                }
                gsap.to(buttonRef.current, {
                    scale: 1.1,
                    duration: 0.3,
                    ease: "power2.out",
                    borderColor: "white",
                    overwrite: "auto",
                });
            } else {
                setCursor("default");
                gsap.to(buttonRef.current, {
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out",
                    borderColor: Theme.border_1,
                    overwrite: "auto",
                });
            }
        }, [hovering, down]);

        const handleMouseEnter = (
            event: React.MouseEvent<HTMLButtonElement>,
        ) => {
            setHovering(true);
            onMouseEnter?.(event);
        };

        const handleMouseLeave = (
            event: React.MouseEvent<HTMLButtonElement>,
        ) => {
            setHovering(false);
            setDown(false);
            onMouseLeave?.(event);
        };

        const handleMouseDown = (
            event: React.MouseEvent<HTMLButtonElement>,
        ) => {
            setDown(true);
            onMouseDown?.(event);
        };

        const handleMouseUp = (event: React.MouseEvent<HTMLButtonElement>) => {
            setDown(false);
            onMouseUp?.(event);
        };

        const handleMouseClick = (
            event: React.MouseEvent<HTMLButtonElement>,
        ) => {
            if (disabled) return;
            onClick?.(event);
        };

        return (
            <button
                className={`pushbutton ${className}`}
                ref={(node) => {
                    buttonRef.current = node!;
                    if (forwardedRef) {
                        if (typeof forwardedRef === "function")
                            forwardedRef(node);
                        else forwardedRef.current = node;
                    }
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onClick={handleMouseClick}
                style={{
                    ...style,
                    cursor: cursor,
                }}
                {...props}
            >
                {children}
            </button>
        );
    },
);

export default PushButton;
