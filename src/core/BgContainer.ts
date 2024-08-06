import { GameObjects, Scene } from "phaser";
import { Size } from "../structure/GeomDefine";
import { LayoutContainer } from "./LayoutContainer";

export class BgContainer extends LayoutContainer {
    private _bg: GameObjects.Image;
    private _rawSize: Size;
    constructor(host: Scene, basis: Size, bg: GameObjects.Image, maxSize?: Size) {
        super(host, basis, maxSize);
        this._bg = bg;
        this._rawSize = { width: bg.width, height: bg.height };
    }
    onResize() {
        const { _bg } = this;
        if (_bg?.active) {
            this.getResultSize();
            let scaleX = this._lw / this._rawSize.width;
            let scaleY = this._lh / this._rawSize.height;
            _bg.setScale(scaleX, scaleY);
        }
    }
}