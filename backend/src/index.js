const express = require("express");
const path = require("path");
const webSocket = require("ws");

const app = express();
const webSocketServer = new webSocket.Server({ port: 8080 });

app.use(express.static(path.join(__dirname, "src")));
app.use(express.json());

app.get("/", (req, res) => {
    console.log(`<<< Received root ping from ${req.ip}.`);
    res.status(301).sendFile(path.join(__dirname, "index.html"), (err) => {
        if (!err) return;
        console.error(err);
        if (!res.headersSent) return;
        res.sendStatus(404);
    });
});

app.get("/api", (_, res) => res.sendStatus(403));

app.get("/api/enabled", (_, res) => res.send(true));

app.get("/api/game", (req, res) => {
    console.log(`<<< Received game request from ${req.ip}.`);
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
            const cameras = parsed.cameras;
            const chosen = cameras[Math.floor(Math.random() * cameras.length)];
            return res.status(200).send({
                lat: chosen.latitude,
                name: chosen.name,
                lon: chosen.longitude,
                feed: `https://traffic.ottawa.ca/camera?id=${chosen.id}`,
            });
        })
        .catch((err) => {
            console.error(err);
            if (res.headersSent) return;
            res.sendStatus(500);
        });
});

webSocketServer.on("connection", (ws) => {
    console.log("New client connected");

    ws.send("Welcome to the WebSocket server!");

    ws.on("message", (message) => {
        console.log(`Received: ${message}`);
        ws.send(`Server received: ${message}`);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

module.exports = app;
