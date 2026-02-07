declare type GamePayload = {
    type: "start" | "guess" | "feed";
};

declare type GameResponsePayload = {
    type: "game" | "guess" | "feed";
    message?: string;
    success: boolean;
    answer?: number[];
    content?: string;
};
