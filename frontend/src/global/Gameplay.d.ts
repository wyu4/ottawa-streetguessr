declare type GamePayload = {
    type: "start" | "guess" | "feed" | "roll";
};

declare type GameResponsePayload = {
    type: "game" | "guess" | "feed" | "error";
    message?: string;
    success: boolean;
    answer?: number[];
    content?: string;
};

declare type GameAnswerPayload = {
    name: string | undefined;
    latlng: number[];
};

declare type GameplayAttributes = DivAttributes & {
    onGuess?: (guess: number[] | undefined, answer: GameAnswerPayload, timeElapsed: number) => void;
};