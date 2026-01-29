import "../styles/Menu.scss";

export default function Menu({ title = "???", children = [] }: MenuAttributes) {
    return <div className="menu">
        <div className="top">
            <h1>{title}</h1>
        </div>
        <div className="body">{children}</div>
    </div>;
}
