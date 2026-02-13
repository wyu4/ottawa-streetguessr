declare type SelectableMapAttributes = {
    zoom?: number;
    center?: LatLngExpression;
    selectionEnabled?: boolean;
    lastReset?: number;
    onSelection?: (latitude: number, longitude: number) => void;
};