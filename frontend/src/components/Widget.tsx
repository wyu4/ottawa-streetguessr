import { forwardRef } from "react";
import "../styles/Widget.scss";

const Widget = forwardRef<HTMLDivElement, DivAttributes>(
    ({ children, className = "" }, ref) => {
        return (
            <div ref={ref} className={`widget ${className}`}>
                {children}
            </div>
        );
    },
);

export default Widget;
