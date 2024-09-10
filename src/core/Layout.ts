import { LayoutHostObject } from "../structure/GameObject";
import { Point, Size } from "../structure/GeomDefine";

export const enum LayoutType {
    /**
     * 全屏
     */
    FullScreen = 0,
    /**
     * 垂直——上
     *
     * @static
     * @type {number}
     */
    TOP = 0b0100,
    /**
     * 垂直——中
     *
     * @static
     * @type {number}
     */
    MIDDLE = 0b1000,

    /**
     * 垂直——下
     *
     * @static
     * @type {number}
     */
    BOTTOM = 0b1100,

    /**
     * 水平——左
     *
     * @static
     * @type {number}
     */
    LEFT = 0b01,

    /**
     * 水平——中
     *
     * @static
     * @type {number}
     */
    CENTER = 0b10,

    /**
     * 水平——右
     *
     * @static
     * @type {number}
     */
    RIGHT = 0b11,

    /**
     * 垂直方向的位运算mask
     *
     * @static
     * @type {number}
     */
    VERTICAL_MASK = 0b1100,

    /**
     * 水平方向位运算mask
     *
     * @static
     * @type {number}
     */
    HORIZON_MASK = 0b11,

    /**
     * 左上
     */
    TOP_LEFT = TOP | LEFT,

    /**
     * 中上
     */
    TOP_CENTER = TOP | CENTER,

    /**
     * 右上
     */
    TOP_RIGHT = TOP | RIGHT,

    /**
     * 左中
     */
    MIDDLE_LEFT = MIDDLE | LEFT,

    /**
     * 中心
     */
    MIDDLE_CENTER = MIDDLE | CENTER,

    /**
     * 右中
     */
    MIDDLE_RIGHT = MIDDLE | RIGHT,

    /**
     * 左下
     */
    BOTTOM_LEFT = BOTTOM | LEFT,

    /**
     * 中下
     */
    BOTTOM_CENTER = BOTTOM | CENTER,

    /**
     * 右下
     */
    BOTTOM_RIGHT = BOTTOM | RIGHT,
}

export const enum LayoutTypeVertical {
    TOP = LayoutType.TOP,
    MIDDLE = LayoutType.MIDDLE,
    BOTTOM = LayoutType.BOTTOM,
}
export const enum LayoutTypeHorizon {
    LEFT = LayoutType.LEFT,
    CENTER = LayoutType.CENTER,
    RIGHT = LayoutType.RIGHT,
}
export interface LayoutDisplay {
    width?: number;
    height?: number;

    x?: number;
    y?: number;

    parent?: LayoutDisplayParent;

    $layoutSize?: Size;

    display?: PhaserDisplayObject;
}
export interface LayoutDisplayParent extends Size {}

export declare type PhaserDisplayObject = Phaser.GameObjects.GameObject & { x: number; y: number };

/**
 * 基于Point位置的布局方式，进行布局
 *
 * @param {number} disWidth
 * @param {number} disHeight
 * @param {number} parentWidth
 * @param {number} parentHeight
 * @param {Point} point
 * @param {Point} [result]
 * @param {number} [padx=0]
 * @param {number} [pady=0]
 * @returns
 */
function getTipLayoutPos(disWidth: number, disHeight: number, parentWidth: number, parentHeight: number, point: Point, result?: Point, padx = 0, pady = 0) {
    let mx = point.x;
    let my = point.y;
    let x = mx + padx;
    let y = my + pady;
    if (disWidth + x + padx > parentWidth) {
        x = parentWidth - disWidth - padx;
        if (x < mx) {
            x = mx - disWidth - padx;
        }
        if (x < 0) {
            x = padx;
        }
    }
    if (disHeight + my + pady > parentHeight) {
        y = parentHeight - disHeight - pady;
        if (y < 0) {
            y = pady;
        }
    }
    result.x = Math.round(x);
    result.y = Math.round(y);
    return result;
}

function getLayoutPos(disWidth: number, disHeight: number, parentWidth: number, parentHeight: number, layout: LayoutType, result?: Point, hoffset = 0, voffset = 0, outerV?: boolean, outerH?: boolean, isContainer = false, bindOriginX = 0, bindOriginY = 0) {
    result = result || {};
    const vertical = layout & LayoutType.VERTICAL_MASK;
    const horizon = layout & LayoutType.HORIZON_MASK;
    let y = 0,
        x = 0;
    switch (vertical) {
        case LayoutType.TOP:
            if (outerV) {
                y = -disHeight;
            }
            break;
        case LayoutType.MIDDLE:
            y = (parentHeight - disHeight) >> 1;
            break;
        case LayoutType.BOTTOM:
            if (outerV) {
                y = parentHeight;
            } else {
                y = parentHeight - disHeight;
            }
            break;
    }
    switch (horizon) {
        case LayoutType.LEFT:
            if (outerH) {
                x = -disWidth;
            }
            break;
        case LayoutType.CENTER:
            x = (parentWidth - disWidth) >> 1;
            break;
        case LayoutType.RIGHT:
            if (outerH) {
                x = parentWidth;
            } else {
                x = parentWidth - disWidth;
            }
            break;
    }
    if (isContainer) {
        y += bindOriginY * disHeight;
        x += bindOriginX * disWidth;
    }
    result.x = Math.round(x + hoffset);
    result.y = Math.round(y + voffset);
    return result;
}

function getLayoutParam(layoutDis: LayoutHostObject, parent?: LayoutDisplayParent) {
    let display;
    if (layoutDis instanceof Phaser.GameObjects.GameObject) {
        display = layoutDis;
    }

    if (!display) {
        console.log(`can not find the target object`);
        return;
    }

    let parentWidth, parentHeight, par;
    if (parent && parent instanceof Phaser.GameObjects.Container) {
        par = parent;
    }
    if (!par) {
        par = display.parentContainer;
    }
    if (!par) {
        if (par.scene) {
            parentWidth = par.scene.scale.width;
            parentHeight = par.scene.scale.height;
        } else {
            parentWidth = window.innerWidth;
            parentHeight = window.innerHeight;
        }
    } else {
        parentWidth = par.width;
        parentHeight = par.height;
    }

    let size = layoutDis.size;
    if (!size) {
        //@ts-ignore
        size = display?.getBounds();
    }

    return { disWidth: size.width, disHeight: size.height, display, parentWidth, parentHeight, parent: par };
}

export const Layout = {
    /**
     * 对DisplayObject，基于父级进行排布
     *
     * @static
     * @param {LayoutDisplay} dis 要布局的可视对象
     * @param {LayoutType} layout 布局方式
     * @param {number} [hoffset=0] 在原布局基础上，水平方向的再偏移量（内部运算是"+",向左传负）
     * @param {number} [voffset=0] 在原布局基础上，垂直方向的再偏移量（内部运算是"+",向上传负）
     * @param {boolean} [outerV=false] 垂直方向上基于父级内部
     * @param {boolean} [outerH=false] 水平方向上基于父级内部
     * @param {LayoutDisplayParent} [parent] 父级容器，默认取可视对象的父级
     */
    layout(dis: LayoutHostObject, layout: LayoutType, hoffset?: number, voffset?: number, outerV?: boolean, outerH?: boolean, parent?: LayoutDisplayParent) {
        const result = getLayoutParam(dis, parent);
        if (!result) return;
        const { disWidth, disHeight, display, parentWidth, parentHeight } = result;
        getLayoutPos(disWidth, disHeight, parentWidth, parentHeight, layout, display, hoffset, voffset, outerV, outerH, dis.isContainer, dis.bindOriginX, dis.bindOriginY);
    },
    getLayoutPos,

    /**
     * 基于point位置的布局方式，进行布局
     *
     * @param {number} disWidth
     * @param {number} disHeight
     * @param {number} parentWidth
     * @param {number} parentHeight
     * @param {Point} point 基准点位置
     * @param {Point} [result]
     * @param {number} [padx=0] 偏移X
     * @param {number} [pady=0] 偏移Y
     * @returns
     */
    getTipLayoutPos,
};
