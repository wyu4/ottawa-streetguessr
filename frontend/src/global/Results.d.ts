declare type ResultsAttributes = DivAttributes & {
    guess: number[] | undefined;
    answer: GameAnswerPayload;
    onHome: () => void;
    onReset: () => void;
};

declare type ResultsMapControllerAttributes = {
    guess: number[];
    answer: number[];
    haversineDistance: number;
};

declare type ResultsLeaveMode = "None" | "Home" | "Restart";

declare type InfoWidgetAttributes = DivAttributes & {
    answer: GameAnswerPayload;
    onHome: () => void;
    onReset: () => void;
    onOpenMaps: () => void;
    disabled: boolean;
    error: number;
};
