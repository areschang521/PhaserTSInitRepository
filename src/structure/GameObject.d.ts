import { LayoutContainer } from "../core/LayoutContainer";

declare type LayoutHostObject = Phaser.GameObjects.GameObject & {
    x?: number;
    y?: number;
    $layoutHost?: LayoutContainer;
    type?: LayoutType;

    left?: number;

    top?: number;

    offsetType?: number;

    outerV?: boolean;
    outerH?: boolean;
    size?: Size;
    right?: number;
    bottom?: number;
}