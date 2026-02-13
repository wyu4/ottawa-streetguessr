declare type GameplayAttributes = DivAttributes & {
    onGuess?: (guess?: number[] | undefined) => void;
};