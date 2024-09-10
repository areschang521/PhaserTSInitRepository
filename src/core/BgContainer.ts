import { GameObjects, Geom, Scene } from "phaser";
import { Size } from "../structure/GeomDefine";
import { LayoutContainer, Temp } from "./LayoutContainer";
import { Layout, LayoutType } from "./Layout";
import { LayoutHostObject } from "../structure/GameObject";

export class BgContainer extends LayoutContainer {
    constructor(host: Scene, basis?: Size, maxSize?: Size) {
        super(host, basis, maxSize);
    }
    /**
     *
     * @param {LayoutType} [layoutType]
     * @param {import("./LayoutContainer").LayoutHostObject} bg
     */
    add(bg: LayoutHostObject, layoutType: LayoutType = LayoutType.MIDDLE_CENTER) {
        //@ts-ignore
        const raw = bg.getBounds();
        const { width: rawWidth, height: rawHeight } = raw;
        //@ts-ignore
        let posX = raw.x + rawWidth * bg.originX;
        //@ts-ignore
        let posY = raw.y + rawHeight * bg.originY;

        const { width: basisWidth, height: basisHeight } = this._basis;

        const offsetRect = new Geom.Rectangle(0, 0, basisWidth, basisHeight);
        const { x: offsetX, y: offsetY, width: offsetWidth, height: offsetHeight } = offsetRect;

        const result = Layout.getLayoutPos(rawWidth, rawHeight, offsetWidth, offsetHeight, layoutType);
        bg.size = raw;
        bg.$layoutHost = this;
        bg.layoutType = layoutType;
        bg.bindLeft = posX - offsetX - result.x;
        bg.bindTop = posY - offsetY - result.y;
        bg.bindRight = offsetX + offsetWidth - posX - rawWidth;
        bg.bindBottom = offsetY + offsetHeight - posY - rawHeight;

        this.$layoutBins.push(bg);

        this.simpleLayout(bg);

        return this;
    }
    /**
     * @override
     */
    onResize() {
        if (this._host?.sys.settings.active) {
            this.getResultSize();
            const { $layoutBins } = this;
            $layoutBins.forEach((bg) => this.simpleLayout(bg));
        }
    }

    /**
     * @param {import("./LayoutContainer").LayoutHostObject} display
     */
    simpleLayout(display: LayoutHostObject) {
        const {
            size: { width: sizeWidth, height: sizeHeight },
            layoutType,
            bindLeft,
            bindTop,
            outerV,
            outerH,
        } = display;
        const pt = Temp.SharedPoint1;
        Layout.getLayoutPos(sizeWidth, sizeHeight, this._lw, this._lh, layoutType, pt, bindLeft, bindTop, outerV, outerH);
        display.x = pt.x;
        display.y = pt.y;
        const scaleX = this._lw / sizeWidth;
        const scaleY = this._lh / sizeHeight;
        //@ts-ignore
        display.setScale(scaleX, scaleY);
    }
}
