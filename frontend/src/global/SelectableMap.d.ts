declare type SelectableMapAttributes = {
    zoom?: number;
    center?: LatLngExpression;
    selectionEnabled?: boolean;
    onSelection?: (latitude: number, longitude: number) => void;
};