import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import "./styles/Index.scss";
import Game from "./pages/Game";
import About from "./pages/About";
import { useCookies } from "react-cookie";

const Tabs = {
    None: "/",
    Home: "/home",
    Game: "/game",
};

function App() {
    const [cookies, setCookie, removeCookie] = useCookies([
        "ottawa_streetguessr_intro_skip",
    ]);

    const navigate = useNavigate();

    const onPlay = () => {
        navigate(Tabs.Game);
    };

    const onHome = () => {
        setCookie("ottawa_streetguessr_intro_skip", true, {
            maxAge: 60 * 60 * 24
        });
        navigate(Tabs.Home);
    };

    return (
        <>
            <div className="main fullscreen">
                <Routes>
                    <Route
                        path={Tabs.None}
                        element={
                            cookies["ottawa_streetguessr_intro_skip"] ===
                                false ||
                            cookies["ottawa_streetguessr_intro_skip"] ===
                                undefined ? (
                                <About onAgree={onHome} />
                            ) : (
                                <Navigate to={Tabs.Home} replace />
                            )
                        }
                    />
                    <Route
                        path={Tabs.Home}
                        element={<Home onPlay={onPlay} />}
                    />
                    <Route
                        path={Tabs.Game}
                        element={<Game onHome={onHome} />}
                    />
                </Routes>
            </div>
        </>
    );
}

export default App;
