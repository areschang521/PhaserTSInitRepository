import { LayoutHostObject } from "../structure/GameObject";
import { Size } from "../structure/GeomDefine";
import { Layout, LayoutType } from "./Layout";
export const Temp = {
    /**
          * 共享点1
          */
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
export abstract class LayoutContainer extends Phaser.Events.EventEmitter {
    public static readonly MIN = Object.freeze({ width: 0, height: 0 });

    protected $layoutBins: LayoutHostObject[] = [];

    protected _lw: number;
    protected _lh: number;

    protected _basis: Size = { width: 640, height: 320 };
    protected _host: Phaser.Scene;
    constructor(basis: Size, host: Phaser.Scene) {
        super();
        // this._basis = basis;
        this._host = host;
        host.sys.events.on(Phaser.Scenes.Events.WAKE, this.onStage, this);
        host.sys.events.on(Phaser.Scenes.Events.ADDED_TO_SCENE, this.onStage, this);
        this._host.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this);
        // host.sys.events.on(Phaser.Scenes.Events.REMOVED_FROM_SCENE, this.offStage, this);
        // host.sys.events.on(Phaser.Scenes.Events.SLEEP, this.offStage, this);
        if (host.sys.settings.active) {
            this.onStage();
        }
        // on(EventConst.ReLayout, this.onResize, this);
    }

    /**
     * 重置尺寸
     * @param basis     
     */
    resetBasis(basis: Size) {
        this._basis = basis;
    }

    onStage() {
        this.onResize();
    }

    offStage() {
        this._host.scale.off(Phaser.Scale.Events.RESIZE, this.onResize, this);
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
            dis.destroy();
        } else {
            // this._host.add(dis, false);
            this._host.children.add(dis);
        }
        let stage = dis.active;
        if (stage) {
            this.binLayout(dis);
        }
        //不管在不在舞台上，都应该监听
        dis.on(Phaser.GameObjects.Events.ADDED_TO_SCENE, this.onAdded.bind(this, dis), this);
    }

    public addLayout(dis: LayoutHostObject, type = LayoutType.TOP_LEFT, size?: Size, left?: number, top?: number, outerV?: boolean, outerH?: boolean, hide?: boolean) {
        let list = this.$layoutBins;
        if (list.indexOf(dis) != -1) {
            return;
        }
        let bin = { dis, type, left, top, outerV, outerH, size } as LayoutBin;
        this.addDis(dis, bin, hide);
    }

    protected onAdded(dis: LayoutHostObject) {
        let host = dis.$layoutHost;
        if (host) {
            let set = host.$layoutBins;
            if (set) {
                let bin = set.indexOf(dis) == -1;
                if (!bin) {
                    this.binLayout(dis);
                }
            }
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