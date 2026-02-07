import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import "./styles/Index.scss";
import Game from "./pages/Game";

const Tabs = {
    None: "/",
    Home: "/home",
    Game: "/game",
};

function App() {
    const navigate = useNavigate();

    const onPlay = () => {
        console.log("Playing...");
        navigate(Tabs.Game);
    };

    return (
        <>
            <div className="main fullscreen">
                <Routes>
                    <Route
                        path={Tabs.None}
                        element={<Navigate to={Tabs.Home} replace />}
                    />
                    <Route
                        path={Tabs.Home}
                        element={<Home onPlay={onPlay} />}
                    />
                    <Route path={Tabs.Game} element={<Game />} />
                </Routes>
            </div>
        </>
    );
}

export default App;
