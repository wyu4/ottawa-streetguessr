import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
        <CookiesProvider>
            <App />
        </CookiesProvider>
    </BrowserRouter>,
);
