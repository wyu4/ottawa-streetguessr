import { forwardRef } from "react";
import "../styles/Widget.scss";

const Widget = forwardRef<HTMLDivElement, DivAttributes>(
    ({ children, className = "", ...props }, ref) => {
        return (
            <div ref={ref} className={`widget ${className}`} {...props}>
                {children}
            </div>
        );
    },
);

export default Widget;
