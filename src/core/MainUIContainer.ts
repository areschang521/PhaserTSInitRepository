import { GameObjects, Geom } from "phaser";
import { LayoutHostObject } from "../structure/GameObject";
import { Layout, LayoutType } from "./Layout";
import { LayoutConst, LayoutContainer } from "./LayoutContainer";
import { EventConst } from "../EventConst";

export class MainUIContainer extends LayoutContainer {
    resizeFlag = true;
    onResize() {
        if (!this._host.sys.settings.active) {
            return;
        }

        const camera = this._host.cameras.main;
        const basis = this._basis;
        const sw = window.innerWidth,
            sh = window.innerHeight,
            bw = basis.width,
            bh = basis.height;

        this.getResultSize();

        const { _lw: lw, _lh: lh } = this;
        let { scale } = getFixedLayout(sw, sh, bw, bh);
        if (scale > LayoutConst.MinScale) {
            let deltaX = (sw - lw) >> 1;
            let deltaY = (sh - lh) >> 1;
            camera.width = lw;
            camera.height = lh;
            camera.x = deltaX;
            camera.y = deltaY;
            camera.scrollX = camera.scrollY = 0;
        } else {
            camera.width = lw;
            camera.height = lh;
            camera.x = 0;
            camera.y = 0;
        }

        this.layoutAll();
        this.emit(EventConst.MAINUI_RESIZE, lw, lh);
    }

    public add(dis: LayoutHostObject, layoutType: LayoutType, origin = { x: 0.5, y: 0.5 }, offsetRect?: Geom.Rectangle, hide?: boolean) {
        //@ts-ignore
        const raw = dis.getBounds();

        let posX = 0;
        let posY = 0;
        const isContainer = dis instanceof GameObjects.Container;
        if (isContainer) {
            posX = dis.x;
            posY = dis.y;
        } else {
            //@ts-ignore
            posX = raw.x + raw.width * dis.originX;
            //@ts-ignore
            posY = raw.y + raw.height * dis.originY;
        }

        offsetRect = offsetRect || new Geom.Rectangle(0, 0, this._basis.width, this._basis.height);

        const result = Layout.getLayoutPos(raw.width, raw.height, offsetRect.width, offsetRect.height, layoutType);
        const dx = posX - offsetRect.x;
        const dy = posY - offsetRect.y;
        const left = dx - result.x;
        const top = dy - result.y;
        const right = offsetRect.x + offsetRect.width - posX - raw.width;
        const bottom = offsetRect.y + offsetRect.height - posY - raw.height;
        dis.bindOriginX = origin.x;
        dis.bindOriginY = origin.y;
        dis.size = raw;
        dis.isContainer = isContainer;
        this.addDis(dis, { size: raw, type: layoutType, left, top, right, bottom, outerV: false, outerH: false }, hide);
        return this;
    }

    protected binLayout(bin: LayoutHostObject) {
        //@ts-ignore
        if (bin.layoutType == LayoutType.FullScreen) {
            const { bindTop: top, bindLeft: left, bindBottom: bottom, bindRight: right } = bin;
            const host = this._host;
            const scaleX = host.scale.displayScale.x;
            const scaleY = host.scale.displayScale.y;
            //@ts-ignore
            const rect = bin.getBounds();
            const sw = window.innerWidth * scaleX,
                sh = window.innerHeight * scaleY;

            if (left != undefined) {
                bin.x = left;
                if (right != undefined) {
                    //@ts-ignore
                    bin.width = sw - left - right;
                }
            } else if (right != undefined) {
                bin.x = sw - rect.width - right;
            }

            if (top != undefined) {
                bin.y = top;
                if (bottom != undefined) {
                    //@ts-ignore
                    bin.height = sh - top - bottom;
                }
            } else if (bottom != undefined) {
                bin.y = sh - rect.height - bottom;
            }
        } else {
            super.binLayout(bin);
        }
    }
}

/**
 * @param sw 舞台宽度
 * @param sh 舞台高度
 * @param bw 要调整的可视对象宽度
 * @param bh 要调整的可视对象高度
 */
export function getFixedLayout(sw: number, sh: number, bw: number, bh: number) {
    let dw = sw,
        dh = sh;
    let scaleX = sw / bw;
    let scaleY = sh / bh;
    let lw = bw;
    let lh = bh;
    let scale: number;
    if (scaleX < scaleY) {
        scale = scaleX;
        dh = scaleX * bh;
        lh = (bh * sh) / dh;
    } else {
        scale = scaleY;
        dw = scaleY * bw;
        lw = (bw * sw) / dw;
    }
    return { dw, dh, scale, lw, lh };
}
