import { LayoutHostObject } from "../structure/GameObject";
import { Layout, LayoutType } from "./Layout";
import { LayoutContainer } from "./LayoutContainer";

export class MainUIContainer extends LayoutContainer {
    resizeFlag = true;
    checkOffset = true;
    onResize() {
        if (!this._host.sys.settings.active) {
            return;
        }
        const camera = this._host.cameras.main;
        const scaleManager = this._host.game.scale;
        let basis = this._basis;
        let sw = window.innerWidth, sh = window.innerHeight, bw = basis.width, bh = basis.height;
        if (this.checkOffset) {
            let { left, right, top, bottom } = Layout.offsets;
            sw -= left + right;
            sh -= top + bottom;
        }
        if (this.resizeFlag) { //屏幕宽高，任意一边小于基准宽高
            let { lw, lh, scale, dw, dh } = getFixedLayout(sw, sh, bw, bh);

            // if (bw > bh) {
            //     this._lw = dw;
            //     this._lh = dh;
            // } else {
            //     this._lw = lw
            //     this._lh = lh;
            // }
            if (scale >= 1) {
                const machineType = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
                if (machineType === 'Mobile') {
                    console.log('移动端');
                    camera.zoom = 1;
                    this._lw = sw;
                    this._lh = sh;
                    if (sw > 2000) {
                        this._lw = 2000;
                    }
                    if (sh > 1000) {
                        this._lh = 1000;
                    }
                    camera.width = this._lw;
                    camera.height = this._lh;
                    let deltaX = 0;
                    let deltaY = 0;
                    deltaX = (sw - this._lw) >> 1;
                    deltaY = (sh - this._lh) >> 1;
                    camera.x = deltaX;
                    camera.y = deltaY;
                } else {
                    console.log('Pc端');
                    if (bw > bh) {
                        this._lw = dw;
                        this._lh = dh;
                    } else {
                        this._lw = lw
                        this._lh = lh;
                    }
                    let deltaX = 0;
                    let deltaY = 0;
                    if (sw > this._lw) {
                        deltaX = (sw - this._lw) >> 1;
                    }
                    if (sh > this._lh) {
                        deltaY = (sh - this._lh) >> 1;
                    }
                    camera.zoom = 1;
                    camera.width = this._lw;
                    camera.height = this._lh;
                    camera.x = deltaX;
                    camera.y = deltaY;
                    console.log(camera.height)
                }
            } else {
                this._lw = bw;
                this._lh = bh;
                let zoomX = sw / this._lw;
                let zoomY = sh / this._lh;
                let zoom = Math.min(zoomX, zoomY);
                camera.zoom = zoom
                camera.width = this._lw;
                camera.height = this._lh;
                let deltaX = 0;
                let deltaY = 0;
                deltaX = (sw - this._lw) >> 1;
                deltaY = (sh - this._lh) >> 1;
                camera.x = deltaX;
                camera.y = deltaY;
                console.log(`parentsize:${scaleManager.parentSize.width}----${scaleManager.parentSize.height}`)
            }
            console.log(camera.height)
            this.layoutAll();
        }
        this.emit("mainUI_Resize", this._lw, this._lh);
    }


    public add(d: LayoutHostObject, type: LayoutType, offsetRect?: { x: number, y: number, width: number, height: number }, hide?: boolean) {
        //@ts-ignore
        let raw = d.getBounds();
        //@ts-ignore
        raw.x += raw.width * d.originX;
        //@ts-ignore
        raw.y += raw.height * d.originY;
        offsetRect = offsetRect || new Phaser.Geom.Rectangle(0, 0, this._basis.width, this._basis.height);
        let result = Layout.getLayoutPos(raw.width, raw.height, offsetRect.width, offsetRect.height, type);
        let dx = raw.x - offsetRect.x;
        let dy = raw.y - offsetRect.y;
        let left = dx - result.x;
        let top = dy - result.y;
        let right = offsetRect.x + offsetRect.width - raw.x - raw.width;
        let bottom = offsetRect.y + offsetRect.height - raw.y - raw.height;

        this.addDis(d, { size: raw, type, left, top, right, bottom, outerV: false, outerH: false }, hide)
    }

    protected binLayout(bin: LayoutHostObject) {
        if (bin.type == LayoutType.FullScreen) {
            let { top, left, bottom, right } = bin;
            let host = this._host;
            let scaleX = host.scale.displayScale.x;
            let scaleY = host.scale.displayScale.y;
            //@ts-ignore
            let rect = bin.getBounds();
            let sw = window.innerWidth, sh = window.innerHeight
            if (this.checkOffset) {
                let { left, right, top, bottom } = Layout.offsets;
                sw -= left + right;
                sh -= top + bottom;
            }
            sw *= scaleX;
            sh *= scaleY;
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
 * @param {boolean} [isWide=false] fixedNarrow 还是 fixedWide，默认按fixedNarrow布局
 */
export function getFixedLayout(sw: number, sh: number, bw: number, bh: number, isWide?: boolean) {
    let dw = sw, dh = sh;
    let scaleX = sw / bw;
    let scaleY = sh / bh;
    let lw = bw;
    let lh = bh;
    let scale: number;
    if (scaleX < scaleY == !isWide) {
        scale = scaleX;
        dh = scaleX * bh;
        // let raw = bh / bw;
        // lh = sw * raw;
        lh = bh * sh / dh;
    } else {
        scale = scaleY;
        dw = scaleY * bw;
        lw = bw * sw / dw;
        // let raw = bw / bh;
        // lw = bh * raw;
    }
    return { dw, dh, scale, lw, lh };
}