import { forwardRef, useEffect, useState } from "react";

import "./../styles/Guide.scss";

const Clock = forwardRef<HTMLDivElement, ParagraphAttributes>(
    ({ className = "", ...props }, ref) => {
        const [currentTime, setCurrentTime] = useState("???");

        useEffect(() => {
            const updateTime = () => {
                const now = new Date();
                const ottawaTime = now.toLocaleTimeString("en-CA", {
                    timeZone: "America/Toronto",
                    hour12: true,
                });
                setCurrentTime(ottawaTime);
            };
            updateTime();

            const timerId = setInterval(updateTime, 1000);

            return () => clearInterval(timerId);
        });

        return (
            <p ref={ref} className={`clock ${className}`} {...props}>
                {currentTime}
            </p>
        );
    },
);

export default Clock;
