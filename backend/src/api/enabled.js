const createEnabledAPI = (app, isEnabled) => {
    app.get("/api/enabled", (req, res) => {
        const response = isEnabled();
        console.log(
            `<<< API/ENABLED: Received ping from ${req.ip}. Response: ${response}`,
        );
        res.send(response);
    });
};

module.exports = createEnabledAPI;