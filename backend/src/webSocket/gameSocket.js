const websocket = require("ws");

const { createCanvas, loadImage } = require("canvas");

const createGameSocket = (server, getCameras, isEnabled, getCurrentTime) => {
    const webSocketServer = new websocket.Server({ server });

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
        let eligibleForRoll = false;

        const feedRateLimit = 17;
        const gameTimeout = 2.5 * 60;

        const resetGame = () => {
            playing = false;
            currentGame = {
                lat: 0,
                name: "",
                lon: 0,
                feed: "",
            };
            lastFeedRequest = 0;
            gameStart = 0;
            eligibleForRoll = false;
        };

        console.log(
            `<<< Websocket connection from ${req.socket.remoteAddress}`,
        );

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

            const roll = () => {
                playing = true;
                gameStart = currentTime;
                eligibleForRoll = false;

                try {
                    const cameras = getCameras();
                    const chosen =
                        cameras[Math.floor(Math.random() * cameras.length)];
                    currentGame.lat = chosen.latitude;
                    currentGame.name = chosen.name;
                    currentGame.lon = chosen.longitude;
                    currentGame.feed = `https://traffic.ottawa.ca/camera?id=${chosen.id}`;
                    // currentGame.feed = `https://traffic.ottawa.ca/camera?id=412`;

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
            };

            // Start a game
            if (parsed.type === "start" && !playing) {
                roll();
            } else if (parsed.type === "roll" && playing && eligibleForRoll) {
                resetGame();
                roll();
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

                        const currentFeedRequest = lastFeedRequest;
                        const validationSize = 100;
                        const validationCanvas = createCanvas(
                            validationSize,
                            validationSize,
                        );
                        const validationCtx = validationCanvas.getContext("2d");
                        validationCtx.drawImage(
                            image,
                            0,
                            0,
                            validationSize,
                            validationSize,
                        );

                        const imageData = validationCtx.getImageData(
                            0,
                            0,
                            validationSize,
                            validationSize,
                        );

                        const colorCounts = new Map();
                        let pixelCount = 0;

                        for (let i = 0; i < imageData.data.length; i += 4) {
                            if (lastFeedRequest != currentFeedRequest) {
                                return;
                            }

                            const red = Math.floor(imageData.data[i] / 16) * 16;
                            const green =
                                Math.floor(imageData.data[i + 1] / 16) * 16;
                            const blue =
                                Math.floor(imageData.data[i + 2] / 16) * 16;
                            const color = `${red},${green},${blue}`;
                            const currentCount = colorCounts.get(color);
                            colorCounts.set(
                                color,
                                currentCount ? currentCount + 1 : 1,
                            );
                            pixelCount++;
                        }

                        let dominatingPercent = 0;
                        if (pixelCount > 0) {
                            dominatingPercent =
                                Math.max(...colorCounts.values()) / pixelCount;
                        }

                        if (dominatingPercent > 0.7) {
                            eligibleForRoll = true;
                            ws.send(
                                JSON.stringify({
                                    type: "feed",
                                    message: "invalid",
                                    success: true,
                                }),
                            );
                        }
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
};

module.exports = createGameSocket;
