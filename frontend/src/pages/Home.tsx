import "../styles/Home.scss";
import Widget from "../components/Widget";
import Parliament from "/Parliament.webp";
import { BsCameraFill } from "react-icons/bs";
import PushButton from "../components/PushButton";
export default function Home() {
    return (
        <div className="home">
            <img className="background" src={Parliament} draggable={false} />
            <h1>Ottawa StreetGuessr</h1>
            <PlayWidget />
        </div>
    );
}

function PlayWidget() {
    return (
        <Widget className="play">
            <PushButton>
                <div className="icon">
                    <BsCameraFill color="#ffffff" />
                </div>
            </PushButton>
        </Widget>
    );
}
