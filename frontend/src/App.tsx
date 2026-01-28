import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import "./styles/Index.scss";

function App() {
    return (
        <>
            <div className="main fullscreen">
                <Routes>{<Route path="/" element={<Home />} />}</Routes>
            </div>
        </>
    );
}

export default App;
