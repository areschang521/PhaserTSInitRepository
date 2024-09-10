import { GameObjects, Geom, Scene } from "phaser";
import { LayoutHostObject } from "../structure/GameObject";
import { Size } from "../structure/GeomDefine";
import { Layout, LayoutType } from "./Layout";
import { LayoutContainer, Temp } from "./LayoutContainer";
import { EventConst } from "../EventConst";
import { GAME_HEIGHT, GAME_WIDTH } from "./Const";

export class CenterObjectContainer extends LayoutContainer {
    constructor(scene: Scene, basis?: Size, maxSize?: Size) {
        super(scene, basis, maxSize);
    }

    /**
     *
     * @param display 绑定的显示对象
     * @param layout layoutType
     * @param origin origin 用于处理容器的偏移(phaser的容器锚点默认为0，但是数据中默认为0.5，需手动从外部传入)
     * @param autoScaleUp 是否根据容器大小/自身的设计比例缩放而进行缩放(默认不做缩放)
     * @param offsetRect
     */
    add(display: LayoutHostObject, layout = LayoutType.MIDDLE_CENTER, origin = { x: 0, y: 0 }, autoScaleUp?: boolean, offsetRect?: { x: number; y: number; width: number; height: number }) {
        //@ts-ignore
        let raw = display.getBounds();
        const { width: rawWidth, height: rawHeight } = raw;
        let posX = 0;
        let posY = 0;
        const isContainer = display instanceof GameObjects.Container;
        if (isContainer) {
            posX = display.x;
            posY = display.y;
        } else {
            //@ts-ignore
            posX = raw.x + rawWidth * display.originX;
            //@ts-ignore
            posY = raw.y + rawHeight * display.originY;
        }
        const { width: basisWidth, height: basisHeight } = this._basis;
        offsetRect = offsetRect || new Geom.Rectangle(0, 0, basisWidth, basisHeight);
        const { x: offsetX, y: offsetY, width: offsetWidth, height: offsetHeight } = offsetRect;
        let result = Layout.getLayoutPos(rawWidth, rawHeight, offsetWidth, offsetHeight, layout);
        display.size = raw;
        display.$layoutHost = this;
        display.layoutType = layout;
        display.left = posX - offsetX - result.x;
        display.top = posY - offsetY - result.y;
        display.right = offsetX + offsetWidth - posX - rawWidth;
        display.bottom = offsetY + offsetHeight - posY - rawHeight;
        display.autoScaleUp = autoScaleUp;
        display.initProportionX = basisWidth / rawWidth;
        display.initProportionY = basisHeight / rawHeight;
        display.bindOriginX = origin.x;
        display.bindOriginY = origin.y;
        display.isContainer = isContainer;
        this.$layoutBins.push(display);
        this.simpleLayout(display);
        return this;
    }

    onResize() {
        if (this._host?.sys.settings.active) {
            this.getResultSize();
            const { $layoutBins } = this;
            $layoutBins.forEach((display) => this.simpleLayout(display));
        }
        this.emit(EventConst.MAINUI_RESIZE, this._lw, this._lh);
    }

    simpleLayout(display: LayoutHostObject) {
        const { _lw: lw, _lh: lh } = this;
        const {
            size: { width: sizeWidth, height: sizeHeight },
            layoutType,
            bindLeft: left,
            bindTop: top,
            outerV,
            outerH,
            autoScaleUp,
            bindOriginX,
            bindOriginY,
        } = display;

        let disScale = 1;
        if (autoScaleUp) {
            let curWid = lw / GAME_WIDTH;
            let curHei = lh / GAME_HEIGHT;
            disScale = Math.min(curWid, curHei);
        }
        //@ts-ignore
        display.setScale(disScale);

        const pt = Temp.SharedPoint1;
        Layout.getLayoutPos(sizeWidth, sizeHeight, lw, lh, layoutType, pt, left, top, outerV, outerH);
        //@ts-ignore
        display.x = pt.x + sizeWidth * (disScale - 1) * (bindOriginX - 0.5);
        //@ts-ignore
        display.y = pt.y + sizeHeight * (disScale - 1) * (bindOriginY - 0.5);
    }
}
