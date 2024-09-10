import { Events, Scale, Scene } from "phaser";
import { game } from "../main";
import { LayoutHostObject } from "../structure/GameObject";
import { Size } from "../structure/GeomDefine";
import { d_memoize } from "./Decorators";
import { Layout, LayoutType } from "./Layout";
import { getFixedLayout } from "./MainUIContainer";
import { GAME_HEIGHT, GAME_WIDTH } from "./Const";
export const Temp = {
    SharedPoint1: { x: 0, y: 0, z: 0 },
};
export const enum LayoutConst {
    MinScale = 0.6,
    MaxWidth = 3840,
    MaxHeight = 2160,
    MaxLayoutScale = 1,
}
export interface LayoutBin {
    type?: LayoutType;
    left?: number;
    top?: number;
    offsetType?: number;
    outerV?: boolean;
    outerH?: boolean;
    size?: Size;
    right?: number;
    bottom?: number;
}
export abstract class LayoutContainer extends Events.EventEmitter {
    protected $layoutBins: LayoutHostObject[] = [];

    protected _lw: number;
    protected _lh: number;
    protected _maxSize: Size;
    protected _basis: Size;
    protected _host: Scene;
    constructor(host: Scene, basis = { width: ~~game.config.width, height: ~~game.config.height }, maxSize = { width: Infinity, height: Infinity }) {
        super();
        this._host = host;
        this._basis = basis;
        this._maxSize = maxSize;
        host.sys.events.on(Phaser.Scenes.Events.WAKE, this.onStage, this);
        this._host.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
        if (host.sys.settings.active) {
            this.onStage();
        }
        return this;
    }

    @d_memoize
    get machineType() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
    }

    getResultSize() {
        const basis = this._basis;
        const { width: mw, height: mh } = this._maxSize;
        const sw = window.innerWidth,
            sh = window.innerHeight,
            bw = basis.width,
            bh = basis.height;

        let { lw, lh, scale, dw, dh } = getFixedLayout(sw, sh, bw, bh);

        if (scale > LayoutConst.MinScale) {
            this._lw = sw;
            this._lh = sh;
            if (sw > mw) {
                this._lw = mw;
            }
            if (sh > mh) {
                this._lh = mh;
            }
        } else {
            const scaleX = sw / bw;
            const scaleY = sh / bh;
            if (scaleX < scaleY) {
                this._lw = bw * LayoutConst.MinScale;
                if (scaleY < LayoutConst.MinScale) {
                    this._lh = bh * LayoutConst.MinScale;
                } else {
                    this._lh = sh;
                }
            } else {
                if (scaleX < LayoutConst.MinScale) {
                    this._lw = bw * LayoutConst.MinScale;
                } else {
                    this._lw = sw;
                }
                this._lh = bh * LayoutConst.MinScale;
            }
        }

        return { lw, lh, scale, dw, dh };
    }

    /**
     * get the game width by current screen size
     * @returns
     */
    getLW() {
        return this._lw;
    }

    /**
     * get the game height by current screen size
     * @returns
     */
    getLH() {
        return this._lh;
    }

    /**
     * resetBasis
     * @param basis
     */
    resetBasis(basis: Size) {
        this._basis = basis;
        const { width, height } = basis;
        const { width: mw, height: mh } = this._maxSize;
        this._maxSize = {
            width: width > mw ? width : mw,
            height: height > mh ? height : mh,
        };
    }

    onStage() {
        this.onResize();
    }

    offStage() {
        this._host.scale.off(Scale.Events.RESIZE, this.onResize, this);
    }

    abstract onResize();

    get scene() {
        return this._host;
    }

    addDis(dis: LayoutHostObject, bin?: LayoutBin, hide?: boolean) {
        const list = this.$layoutBins;
        if (list.indexOf(dis) != -1) {
            return;
        }
        //@ts-ignore
        dis.size = bin.size || dis.getBounds();
        dis.$layoutHost = this;
        dis.layoutType = bin.type;
        dis.bindLeft = bin.left;
        dis.bindTop = bin.top;
        dis.bindRight = bin.right;
        dis.bindBottom = bin.bottom;
        dis.offsetType = bin.offsetType;
        dis.outerH = bin.outerH;
        dis.outerV = bin.outerV;
        list.push(dis);

        if (hide) {
            dis.removeFromDisplayList();
        } else {
            // if (dis.displayList == null) {
            dis.addToDisplayList();
            // }
        }

        let stage = dis.active;
        if (stage) {
            this.binLayout(dis);
        }
    }
    protected binLayout(dis: LayoutHostObject) {
        const {
            layoutType,
            bindLeft: hoffset,
            bindTop: voffset,
            outerV,
            outerH,
            size: { width: sizeWidth, height: sizeHeight },
        } = dis;

        const pt = Temp.SharedPoint1;
        Layout.getLayoutPos(sizeWidth, sizeHeight, this._lw, this._lh, layoutType, pt, hoffset, voffset, outerV, outerH);

        let disScale = 1;
        let curWid = this._lw / GAME_WIDTH;
        let curHei = this._lh / GAME_HEIGHT;
        disScale = Math.min(curWid, curHei, LayoutConst.MaxLayoutScale);
        //@ts-ignore
        dis.setScale(disScale);
        //@ts-ignore
        dis.x = pt.x;
        //@ts-ignore
        dis.y = pt.y;
    }

    protected layoutAll() {
        let list = this.$layoutBins;
        if (list) {
            for (let i = 0, len = list.length; i < len; ) {
                this.binLayout(list[i++]);
            }
        }
    }
}
