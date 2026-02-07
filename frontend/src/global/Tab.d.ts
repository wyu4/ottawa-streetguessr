import { TabID } from "../enums/Tab";

declare type TabAttributes = DivAttributes & {
    currentTab?: TabID;
};

declare type HomeTabAttributes = TabAttributes & {
    onPlay?: () => void;
};
