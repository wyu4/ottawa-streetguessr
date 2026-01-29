import "../styles/Widget.scss";

export default function Widget({
    children,
    className = "",
}: DivAttributes) {
    return <div className={`widget ${className}`}>{children}</div>;
}
