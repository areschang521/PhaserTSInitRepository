import { Events, Scale, Scene } from "phaser";
import { game } from "../main";
import { LayoutHostObject } from "../structure/GameObject";
import { Size } from "../structure/GeomDefine";
import { d_memoize } from "./Decorators";
import { Layout, LayoutType } from "./Layout";
import { getFixedLayout } from "./MainUIContainer";
export const Temp = {
    SharedPoint1: { x: 0, y: 0, z: 0 },
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
    constructor(host: Scene, basis?: Size, maxSize?: Size) {
        super();
        this._host = host;
        this._basis = basis || { width: ~~game.config.width, height: ~~game.config.height };
        this._maxSize = maxSize || { width: this._basis.width, height: this._basis.height };
        host.sys.events.on(Phaser.Scenes.Events.WAKE, this.onStage, this);
        host.sys.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, this.onStage, this);
        this._host.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
        // host.sys.events.on(Phaser.Scenes.Events.REMOVED_FROM_SCENE, this.offStage, this);
        // host.sys.events.on(Phaser.Scenes.Events.SLEEP, this.offStage, this);
        if (host.sys.settings.active) {
            this.onStage();
        }
    }

    @d_memoize
    get machineType() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'
    }

    getResultSize() {
        let basis = this._basis;
        const { width: mw, height: mh } = this._maxSize;
        let sw = window.innerWidth, sh = window.innerHeight, bw = basis.width, bh = basis.height;
        let { lw, lh, scale, dw, dh } = getFixedLayout(sw, sh, bw, bh);
        if (scale >= 1) {
            if (this.machineType === 'Mobile') {
                console.log('Mobile');
                this._lw = sw;
                this._lh = sh;
                if (sw > mw) {
                    this._lw = mw;
                }
                if (sh > mh) {
                    this._lh = mh;
                }
            } else {
                console.log('Pc');
                if (bw > bh) {
                    this._lw = dw;
                    this._lh = dh;
                } else {
                    this._lw = lw
                    this._lh = lh;
                }
            }
        } else {
            this._lw = bw;
            this._lh = bh;
        }
        return { lw, lh, scale, dw, dh };
    }

    /**
     * resetBasis
     * @param basis     
     */
    resetBasis(basis: Size) {
        this._basis = basis;
        const { width, height } = basis;
        const { width: mw, height: mh } = this._maxSize;
        this._maxSize = { width: width > mw ? width : mw, height: height > mh ? height : mh };
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
        let list = this.$layoutBins;
        if (list.indexOf(dis) != -1) {
            return;
        }
        //@ts-ignore
        bin = bin || { type: LayoutType.TOP_LEFT, size: dis.getBounds() } as LayoutBin;
        //@ts-ignore
        dis.size = bin.size || dis.getBounds();
        dis.$layoutHost = this;
        dis.type = bin.type;
        dis.left = bin.left;
        dis.top = bin.top;
        dis.right = bin.right;
        dis.bottom = bin.bottom;
        dis.offsetType = bin.offsetType;
        dis.outerH = bin.outerH;
        dis.outerV = bin.outerV;
        list.push(dis);
        if (hide) {
            dis.removeFromDisplayList();
        } else {
            dis.addToDisplayList();
        }
        let stage = dis.active;
        if (stage) {
            this.binLayout(dis);
        }
    }
    protected binLayout(bin: LayoutHostObject) {
        const { type, left: hoffset, top: voffset, outerV, outerH, size } = bin;
        let pt = Temp.SharedPoint1;
        Layout.getLayoutPos(size.width, size.height, this._lw, this._lh, type, pt, hoffset, voffset, outerV, outerH);
        bin.x = pt.x;
        bin.y = pt.y;
    }

    protected $doLayout() {
        setTimeout(() => {
            this.layoutAll();
        }, 100);
    }
    protected layoutAll() {
        let list = this.$layoutBins;
        if (list) {
            for (let i = 0, len = list.length; i < len;) {
                this.binLayout(list[i++]);
            }
        }
    }
}   