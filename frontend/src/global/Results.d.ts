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
