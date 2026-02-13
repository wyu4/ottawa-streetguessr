const express = require("express");
const path = require("path");
const http = require("http");
const websocket = require("ws");

const app = express();
const server = http.createServer(app);
const webSocketServer = new websocket.Server({ server });

const { createCanvas, loadImage } = require("canvas");

app.use(express.static(path.join(__dirname, "src")));
app.use(express.json());

app.get("/", (req, res) => {
    console.log(`<<< Received root ping from ${req.ip}.`);
    res.sendFile(path.join(__dirname, "index.html"), (err) => {
        if (!err) return;
        console.error(err);
        if (!res.headersSent) return;
        res.sendStatus(404);
    });
});

app.get("/api", (_, res) => res.sendStatus(403));

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

app.get("/api/enabled", (_, res) => res.send(isEnabled()));

webSocketServer.on("connection", (ws, req) => {
    let playing = false;
    let currentGame = {
        lat: 0,
        name: "",
        lon: 0,
        feed: "",
    };
    let lastFeedRequest = 0;
    let gameStart = 0;

    const feedRateLimit = 17;
    const gameTimeout = 2.5 * 60;

    const resetGame = () => {
        currentGame = {
            lat: 0,
            name: "",
            lon: 0,
            feed: "",
        };
        lastFeedRequest = 0;
    };

    console.log(`<<< Websocket connection from ${req.socket.remoteAddress}`);

    ws.on("message", async (data) => {
        if (!isEnabled()) {
            return ws.send(
                JSON.stringify({
                    type: "error",
                    message: "The server is currently down.",
                    success: false,
                }),
            );
        }

        let parsed;
        try {
            parsed = JSON.parse(data.toString());
        } catch (err) {
            console.error(err);
            return;
        }

        const currentTime = getCurrentTime();

        console.log(
            `<<< Websocket received message from ${req.socket.remoteAddress}: ${data.toString()}`,
        );

        // Start a game
        if (parsed.type === "start" && !playing) {
            playing = true;
            gameStart = currentTime;

            try {
                const chosen =
                    cameras[Math.floor(Math.random() * cameras.length)];
                currentGame.lat = chosen.latitude;
                currentGame.name = chosen.name;
                currentGame.lon = chosen.longitude;
                currentGame.feed = `https://traffic.ottawa.ca/camera?id=${chosen.id}`;

                return ws.send(
                    JSON.stringify({
                        type: "game",
                        message: "Game successfully started.",
                        success: true,
                    }),
                );
            } catch (err) {
                console.error(err);
                ws.send(
                    JSON.stringify({
                        type: "game",
                        message: "Could not start game.",
                        success: false,
                    }),
                );
            }

            playing = false;
            gameStart = 0;
        } else if (parsed.type === "guess" && playing) {
            try {
                ws.send(
                    JSON.stringify({
                        type: "guess",
                        message: currentGame.name,
                        success: true,
                        answer: [currentGame.lat, currentGame.lon],
                    }),
                );
                resetGame();
                playing = false;
                return;
            } catch (err) {
                console.error(err);
                ws.send(
                    JSON.stringify({
                        type: "guess",
                        message: "Could not register guess.",
                        success: false,
                    }),
                );
            }
        } else if (
            parsed.type === "feed" &&
            playing &&
            currentTime - lastFeedRequest >= feedRateLimit
        ) {
            lastFeedRequest = currentTime;

            if (currentTime - gameStart > gameTimeout) {
                return ws.send(
                    JSON.stringify({
                        type: "feed",
                        message: "Failed to fetch feed: Session expired.",
                        success: false,
                    }),
                );
            }

            fetch(currentGame.feed, {
                method: "GET",
                headers: {
                    "Content-Type": "image/jpeg",
                },
            })
                .then((data) => data.arrayBuffer())
                .then((buffer) => loadImage(Buffer.from(buffer)))
                .then((image) => {
                    const canvas = createCanvas(image.width, image.height);
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(image, 0, 0);
                    const compressedBuffer = canvas.toBuffer("image/jpeg", {
                        quality: 0.75,
                    });

                    ws.send(
                        JSON.stringify({
                            type: "feed",
                            content: "image/jpeg",
                            success: true,
                        }),
                    );
                    ws.send(compressedBuffer);
                })
                .catch((err) => {
                    console.error(err);
                    ws.send(
                        JSON.stringify({
                            type: "feed",
                            message: "Could not load feed.",
                            success: false,
                        }),
                    );
                });
        }
    });

    ws.on("close", () => {
        console.log(
            `<<< Websocket disconnected from ${req.socket.remoteAddress}`,
        );
        resetGame();
    });
});

server.listen(3000, () => {
    console.log("Express running on http://localhost:3000");
});
