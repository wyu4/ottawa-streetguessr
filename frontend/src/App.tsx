import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import "./styles/Index.scss";
import { useState } from "react";
import { TabID } from "./enums/Tab";

function App() {
    const [currentTab, setCurrentTab] = useState(TabID.Home);

    const onPlay = () => {
        console.log("Playing...");
        setCurrentTab(TabID.None);
    };

    return (
        <>
            <div className="main fullscreen">
                <Routes>
                    {
                        <Route
                            path="/"
                            element={
                                <Home onPlay={onPlay} currentTab={currentTab} />
                            }
                        />
                    }
                </Routes>
            </div>
        </>
    );
}

export default App;
