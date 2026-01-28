import type { ReactNode } from "react";
import '../styles/Menu.scss';

export default function Menu({ children = [] }: { children?: ReactNode[] }) {
    return <div className="menu">{children}</div>;
}
