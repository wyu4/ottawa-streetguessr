declare type HomeTabAttributes = DivAttributes & {
    onPlay?: () => void;
};

declare type GameTabAttributes = DivAttributes & {
    onHome?: () => void;
};