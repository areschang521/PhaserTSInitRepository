import { LayoutHostObject } from "../structure/GameObject";
import { Size } from "../structure/GeomDefine";
import { Layout, LayoutType } from "./Layout";
import { LayoutBin, LayoutContainer } from "./LayoutContainer";
import { getFixedLayout } from "./MainUIContainer";

export class CenterObjectContainer extends LayoutContainer {
    protected _layout: LayoutType;
    protected _bg: Phaser.GameObjects.GameObject
    protected _size: Size;
    private _dis: LayoutHostObject;
    constructor(basis: Size, bg: Phaser.GameObjects.GameObject, scene: Phaser.Scene, size: Size, layout = LayoutType.MIDDLE_CENTER, offsetRect?: { x: number, y: number, width: number, height: number }) {
        super(basis, scene);
        this._layout = layout;
        this._bg = bg;
        this._size = size;
        //@ts-ignore
        let raw = bg.getBounds();
        //@ts-ignore
        raw.x += raw.width * bg.originX;
        //@ts-ignore
        raw.y += raw.height * bg.originY;
        offsetRect = offsetRect || new Phaser.Geom.Rectangle(0, 0, this._basis.width, this._basis.height);
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
        dis.size = bin.size || bg.getBounds();
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
        let bg = this._bg;
        if (bg) {
            this.getResultSize();
            let scaleX = this._lw / this._size.width;
            let scaleY = this._lh / this._size.height;
            let disScale = 1;
            if (scaleX < 1 || scaleY < 1) {
                disScale = Math.min(scaleX, scaleY);
                (bg as Phaser.GameObjects.Image).setScale(disScale, disScale);
            } else {
                (bg as Phaser.GameObjects.Image).setScale(1, 1);
            }
            const { type, left: hoffset, top: voffset, outerV, outerH, size } = this._dis;
            let pt = { x: 0, y: 0 };
            Layout.getLayoutPos(size.width, size.height, this._lw, this._lh, type, pt, hoffset, voffset, outerV, outerH);
            //@ts-ignore
            bg.x = pt.x;
            //@ts-ignore
            bg.y = pt.y;

        }
    }
}