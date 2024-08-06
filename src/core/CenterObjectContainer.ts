import { GameObjects, Geom, Scene } from "phaser";
import { LayoutHostObject } from "../structure/GameObject";
import { Size } from "../structure/GeomDefine";
import { Layout, LayoutType } from "./Layout";
import { LayoutBin, LayoutContainer, Temp } from "./LayoutContainer";

export class CenterObjectContainer extends LayoutContainer {
    protected _layout: LayoutType;
    protected _display: GameObjects.GameObject
    protected _size: Size;
    private _dis: LayoutHostObject;
    private _autoScaleUp: boolean;
    constructor(display: GameObjects.GameObject, scene: Scene, basis: Size, size: Size, maxSize?: Size, layout = LayoutType.MIDDLE_CENTER, autoScaleUp?: boolean, offsetRect?: { x: number, y: number, width: number, height: number }) {
        super(scene, basis, maxSize);
        this._layout = layout;
        this._display = display;
        this._size = size;
        this._autoScaleUp = autoScaleUp;
        //@ts-ignore
        let raw = display.getBounds();
        //@ts-ignore
        raw.x += raw.width * display.originX;
        //@ts-ignore
        raw.y += raw.height * display.originY;
        offsetRect = offsetRect || new Geom.Rectangle(0, 0, this._basis.width, this._basis.height);
        let result = Layout.getLayoutPos(raw.width, raw.height, offsetRect.width, offsetRect.height, layout);
        let dx = raw.x - offsetRect.x;
        let dy = raw.y - offsetRect.y;
        let left = dx - result.x;
        let top = dy - result.y;
        let right = offsetRect.x + offsetRect.width - raw.x - raw.width;
        let bottom = offsetRect.y + offsetRect.height - raw.y - raw.height;
        let bin = { size: raw, type: layout, left, top, right, bottom, outerV: false, outerH: false }
        let dis = this._dis = {} as LayoutHostObject;
        //@ts-ignore
        dis.size = bin.size || display.getBounds();
        dis.$layoutHost = this;
        dis.type = bin.type;
        dis.left = bin.left;
        dis.top = bin.top;
        dis.right = bin.right;
        dis.bottom = bin.bottom;
        dis.outerH = bin.outerH;
        dis.outerV = bin.outerV;
    }

    onResize() {
        if (this._display?.active) {
            const { _display, _size: { width: sizeWidth, height: sizeHeight }, _dis: { type, left: hoffset, top: voffset, outerV, outerH, size } } = this;
            let { scale } = this.getResultSize();
            if (scale > 1) {
                let scaleX = this._lw / sizeWidth;
                let scaleY = this._lh / sizeHeight;
                let disScale = 1;
                if (scaleX < 1 || scaleY < 1) {
                    disScale = Math.min(scaleX, scaleY);
                } else {
                    if (this._autoScaleUp) {
                        disScale = scale;
                    }
                }
                //@ts-ignore
                _display.setScale(disScale);
            }
            let pt = Temp.SharedPoint1
            Layout.getLayoutPos(size.width, size.height, this._lw, this._lh, type, pt, hoffset, voffset, outerV, outerH);
            //@ts-ignore
            _display.x = pt.x;
            //@ts-ignore
            _display.y = pt.y;

        }
    }
}