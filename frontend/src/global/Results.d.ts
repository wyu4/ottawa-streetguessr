declare type ResultsAttributes = DivAttributes & {
    guess: number[] | undefined;
    answer: GameAnswerPayload;
    timeElapsed: number;
};

declare type ResultsMapControllerAttributes = {
    guess: number[],
    answer: number[]
}