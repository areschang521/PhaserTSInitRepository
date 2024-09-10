import { LayoutContainer } from "../core/LayoutContainer";

declare type LayoutHostObject = Phaser.GameObjects.GameObject & {
    x?: number;
    y?: number;
    $layoutHost?: LayoutContainer;
    left?: number;
    top?: number;
    offsetType?: number;
    outerV?: boolean;
    outerH?: boolean;
    size?: Size;
    right?: number;
    bottom?: number;
    autoScaleUp?: boolean;
    /**
     * 设计界面宽度/显示对象宽度比例(初始数据，用于对比)
     */
    initProportionX?: number;
    /**
     * 设计界面高度/显示对象高度比例(初始数据，用于对比)
     */
    initProportionY?: number;
    /**
     * 手动绑定的锚点数据
     */
    bindOriginX?: number;
    bindOriginY?: number;
    layoutType?: LayoutType;
    bindLeft?: number;
    bindTop?: number;
    bindRight?: number;
    bindBottom?: number;
    isContainer?:boolean
};
