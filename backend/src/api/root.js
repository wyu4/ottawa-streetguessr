const createRootAPI = (app, path) => {
    app.get("/", (req, res) => {
        console.log(`<<< Received root ping from ${req.ip}.`);
        res.sendFile(path.join(__dirname, "..", "index.html"), (err) => {
            if (!err) return;
            console.error(err);
            if (!res.headersSent) return;
            res.sendStatus(404);
        });
    });

    app.get("/api", (_, res) => res.sendStatus(403));
};

module.exports = createRootAPI;
