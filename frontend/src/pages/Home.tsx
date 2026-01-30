import "../styles/Home.scss";
import Widget from "../components/Widget";
import Parliament from "/Parliament.webp";

export default function Home() {
    return (
        <div className="home">
            <img className="background" src={Parliament} draggable={false} />
            <h1>Ottawa StreetGuessr</h1>
            <Widget className="play">
                <button>
                </button>
            </Widget>
        </div>
    );
}
