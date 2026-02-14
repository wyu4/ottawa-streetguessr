const express = require("express");
const path = require("path");
const http = require("http");

const createEnabledAPI = require("./api/enabled");
const createGameSocket = require("./webSocket/gameSocket");
const createRootAPI = require("./api/root");

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "src")));
app.use(express.json());

let cameras = [];
let enabled = false;
fetch("https://traffic.ottawa.ca/map/service/camera", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
})
    .then((response) => {
        return response.json();
    })
    .then((parsed) => {
        cameras = parsed.cameras;
        enabled = true;
        console.log("<<< Received & stored camera data.");
    })
    .catch((err) => {
        enabled = false;
        console.error(err);
    });

function isEnabled() {
    return enabled && process.env.SERVER_ENABLED === "1";
}

function getCurrentTime() {
    return Math.floor(Date.now() / 1000);
}

createRootAPI(app, path);
createEnabledAPI(app, isEnabled);

createGameSocket(server, () => cameras, isEnabled, getCurrentTime);

server.listen(3000, () => {
    console.log("Express running on http://localhost:3000");
});
