import { Size } from "../structure/GeomDefine";
import { LayoutContainer } from "./LayoutContainer";

export class BgContainer extends LayoutContainer {
    private _bg: Phaser.GameObjects.Image;
    private _rawSize: Size;
    constructor(basis: Size, host: Phaser.Scene, bg: Phaser.GameObjects.Image) {
        super(basis, host);
        this._bg = bg;
        this._rawSize = { width: bg.width, height: bg.height };
    }
    onResize() {
        if (!this._bg) {
            return;
        }
        this.getResultSize();
        let scaleX = this._lw / this._rawSize.width;
        let scaleY = this._lh / this._rawSize.height;
        this._bg.setScale(scaleX, scaleY);
    }
}