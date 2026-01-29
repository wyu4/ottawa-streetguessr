import "../styles/Home.scss";
import Widget from "../components/Widget";

export default function Home() {
    return (
        <div className="home background">
            <h1>Ottawa StreetGuessr</h1>
            <Widget className="play">
                <button> <p>{">"}</p></button>
            </Widget>
        </div>
    );
}
