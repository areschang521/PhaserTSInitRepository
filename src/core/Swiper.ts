import { GameObjects, Input, Scene, Time } from "phaser";
import EventEmitter from "phaser3-rex-plugins/plugins/utils/eventemitter/EventEmitter";
import { Point } from "../structure/GeomDefine";
import { EventConst } from "../EventConst";
export const enum SwiperDirection {
    Left = "left",
    Right = "right",
}

export interface SwiperPosition {
    x: number;
    y: number;
    scale: number;
    depth: number;
    alpha?: number;
    bright?: number;
}

export interface SwiperOption {
    scene: Scene;
    con: GameObjects.Container;
    duration: number;
    props: SwiperPosition[];
    items: GameObjects.GameObject[];
    waitTime: number;
    canDrag?: boolean;
    direction: "left" | "right";
}

export declare type SwiperItem = GameObjects.GameObject & { x: number; y: number; alpha: number; preFX: Phaser.GameObjects.Components.FX | null };

export class Swiper extends EventEmitter {
    private depthMoved: boolean;
    dragStartTime: number;
    /**
     * List of properties to bind to the position
     * @private
     */
    propArr: SwiperPosition[];
    /**
     * show items
     * @type {GameObjects.GameObject[]}
     * @private
     */
    showItems: SwiperItem[];
    /**
     * time loop duration
     * @type {number}
     * @private
     */
    duration: number;
    /**
     * @type {Scene}
     * @private
     */
    scene: Scene;
    /**
     * Container for binding locations
     * The display objects at the corresponding positions should be placed to mark the size of the container to facilitate the adaptation of the position and size
     * @type {GameObjects.Container}
     * @private
     */
    host: GameObjects.Container;
    /**
     * show item tween duration
     * @type {number}
     * @private
     */
    tweenTime: number;
    /**
     * the postion of drag start
     * @type {{x:number,y:number}}
     * @private
     */
    dragStartPoint: Point;
    /**
     * Used to record the index of the current moving position
     * @type {number}
     * @private
     */
    itemIdx: number = 0;
    /**
     * During the tweening process
     * @type {boolean}
     * @private
     */
    isTween: boolean;
    /**
     * time event is executing
     * @type {boolean}
     * @private
     */
    timeMoving: boolean;
    /**
     * the time event of auto move
     * @type {Phaser.Time.TimerEvent}
     * @private
     */
    timeTicker: Time.TimerEvent | null;
    /**
     * Set the moving direction
     * @type {string}
     * @private
     */
    setDirection: "left" | "right";
    /**
     * Current moving direction
     * @type {string}
     * @private
     */
    direction: "left" | "right";
    /**
     * The timestamp of delayed execution of the resize method
     * @type {number}
     * @private
     */
    delayTime: number = -1;
    /**
     * @param { Object} opt
     * @param { Scene} opt.scene
     * @param { GameObjects.Container} opt.con
     * @param { number} opt.duration
     * @param { SwiperPosition[]} opt.props
     * @param { GameObjects.GameObject[]} opt.items
     * @param { number} opt.waitTime
     * @param { boolean} [opt.canDrag]
     * @param { string} [opt.direction]
     */
    constructor(opt: SwiperOption) {
        super();
        const { scene, con, duration, props, items, waitTime, canDrag, direction } = opt;
        this.setDirection = direction;
        this.scene = scene;
        this.host = con;
        this.duration = duration;
        this.tweenTime = duration - waitTime;
        const showItems: SwiperItem[] = (this.showItems = []);
        items.forEach((item) => {
            showItems.push(item as SwiperItem);
        });
        const itemLen = showItems.length;
        //Set the position data alpha to 1 and the disappearing position to 0
        const propArr: SwiperPosition[] = (this.propArr = []);
        const propLen = props.length;
        props.forEach((prop) => {
            const p: SwiperPosition = prop.$clone() as SwiperPosition;
            p.alpha = 1;
            propArr.push(p);
        });
        const oversize = itemLen > propLen;
        if (oversize) {
            //When the display list length is l more than coordinate list length, a disappearance operation needs to be performed, and the position data for disappearance is added at the back middle
            if (itemLen - propLen == 1) {
                const centerIdx = ~~((propLen + 1) / 2);
                const centerPos = props[centerIdx];
                const addCenter: SwiperPosition = centerPos.$clone() as SwiperPosition;
                addCenter.depth = 0;
                addCenter.scale = 0.1;
                addCenter.alpha = 0;
                propArr.push(addCenter);
            } else {
                //When the display list length is greater than the coordinate list length by more than 1, a disappearance operation needs to be performed, and the position data for disappearance is added at the beginning and end
                const last = props[propLen - 1];
                const addLast: SwiperPosition = last.$clone() as SwiperPosition;
                addLast.depth = 0;
                addLast.scale = 0.1;
                addLast.alpha = 0;
                propArr.push(addLast);

                const first = props[0];
                const addFirst: SwiperPosition = first.$clone() as SwiperPosition;
                addFirst.depth = 0;
                addFirst.scale = 0.1;
                addFirst.alpha = 0;
                propArr.unshift(addFirst);
            }
        }
        //Initialize the initial coordinates of the display list
        for (let i = 0; i < itemLen; i++) {
            const item = showItems[i];
            let propLen = propArr.length;

            const posIdx = Math.min(i, propLen - 1);
            item.setData("pos", posIdx);
            //Hide display objects that are not initially displayed
            item.alpha = i < propLen ? 1 : 0;
            //Add a matrix object to the display object to add a grayscale effect
            const fx = item.preFX?.addColorMatrix();
            item.setData("fx", fx);
            //Set whether to drag
            if (canDrag) {
                item.setInteractive({ draggable: true });
            }
        }
        scene.input.on(Phaser.Input.Events.GAMEOBJECT_DOWN, this.dragStartHandler, this);
        scene.input.on(Phaser.Input.Events.GAMEOBJECT_UP, this.dragEndHandler, this);
        //Formal layout of the display list
        this.resetItems();
    }

    /**
     *  start drag
     * @param {{x:number,y:number}} param0 //pointer postion
     * @private
     */
    dragStartHandler({ x, y }: { x: number; y: number }) {
        //record the start drag postion ,for compare
        this.dragStartPoint = { x, y };
        this.dragStartTime = this.scene.time.now;
    }

    /**
     * drag end
     */
    dragEndHandler(pt: Input.Pointer, target: SwiperItem) {
        const { x, y } = pt;
        const {
            dragStartPoint,
            scene: { time },
            dragStartTime,
        } = this;
        if (!dragStartPoint) {
            return;
        }
        const now = time.now;
        const { x: startX, y: startY } = dragStartPoint;

        const delta = now - dragStartTime;
        const dist = (x - startX) * (x - startX) + (y - startY) * (y - startY);
        if (delta < 200 || dist < 225) {
            this.emit(EventConst.SwiperItemClick, target);
            return;
        }
        if (this.dragStartPoint) {
            //compare x for check the move direction
            this.setMoveOnce(startX > x ? SwiperDirection.Left : SwiperDirection.Right);
            this.dragStartPoint = undefined;
        }
    }

    /**
     * Accept external movement instructions
     * @param {string} direction
     */
    setMoveOnce(direction: "left" | "right") {
        if (!this.isTween) {
            if (this.timeTicker) {
                this.timeTicker.remove();
            }
            this.scene.tweens.tweens.forEach((tween) => {
                tween.stop();
                tween.complete();
                this.scene.tweens.remove(tween);
            });
            this.timeMoving = false;
            this.doMove(direction);
        }
    }

    /**
     * truly to move
     * @param {string} direction
     * @private
     */
    doMove(direction: "left" | "right") {
        this.direction = direction;
        const left = direction == SwiperDirection.Left;
        this.isTween = true;
        const { showItems, propArr, itemIdx } = this;
        const len = propArr.length;
        const itemsLen = showItems.length;
        let showItem: SwiperItem;
        let nextProp: SwiperPosition;
        let nextItemIdx: number;
        this.depthMoved = false;
        for (let i = 0; i < len; i++) {
            if (left) {
                nextItemIdx = (itemIdx + i) % itemsLen;
                showItem = showItems[nextItemIdx];
                nextProp = propArr[i - 1] || propArr[len - 1];
            } else {
                nextItemIdx = (itemIdx - 1 + i) % itemsLen;
                nextProp = propArr[i];
            }
            if (nextItemIdx < 0) {
                nextItemIdx = itemsLen - 1;
            }
            showItem = showItems[nextItemIdx];
            const { x, y, scale, bright, alpha } = nextProp;
            const pp = propArr.indexOf(nextProp);
            this.tweenItem(showItem, x, y, pp, bright, scale, alpha);
        }
    }

    /**
     * get the show items on show and sort by depth
     * The depth in the container is sorted according to the display list, so the order needs to be processed in advance and then processed together
     * @returns
     */
    getDepthArray() {
        const left = this.direction == SwiperDirection.Left;
        const { showItems, propArr, itemIdx } = this;
        const len = propArr.length;
        const itemsLen = showItems.length;
        const result: { showItem: SwiperItem; depth: number }[] = [];
        let showItem: SwiperItem;
        let nextProp: SwiperPosition;
        let nextItemIdx: number;
        for (let i = 0; i < len; i++) {
            if (left) {
                nextItemIdx = (itemIdx + i) % itemsLen;
                showItem = showItems[nextItemIdx];
                nextProp = propArr[i - 1] || propArr[len - 1];
            } else {
                nextItemIdx = (itemIdx - 1 + i) % itemsLen;
                nextProp = propArr[i];
            }
            if (nextItemIdx < 0) {
                nextItemIdx = itemsLen - 1;
            }
            showItem = showItems[nextItemIdx];
            const { depth } = nextProp;
            result.push({
                showItem,
                depth,
            });
        }
        result.sort((a, b) => {
            return a.depth - b.depth;
        });
        return result;
    }

    /**
     * check index of the items for next move
     * @param {boolean} toLeft
     * @private
     */
    checkNextMoveIdx(toLeft: boolean) {
        const { showItems } = this;
        const itemLen = showItems.length;
        let itemNext = 0;
        if (toLeft) {
            itemNext = this.itemIdx + 1;
        } else {
            itemNext = this.itemIdx - 1;
            if (itemNext < 0) {
                itemNext = itemLen - 1;
            }
        }
        this.itemIdx = itemNext % itemLen;
    }

    /**
     * Performing a Move Effect
     * @param {GameObjects.GameObject} showItem
     * @param {number} x
     * @param {number} y
     * @param {number} bright
     * @param {number} scale
     * @param {number} nextPropIdx
     * @param {number} alpha
     * @private
     */
    tweenItem(showItem: SwiperItem, x: number, y: number, nextPropIdx: number, bright?: number, scale?: number, alpha?: number) {
        //change the postion and alpha
        //@ts-ignore
        const rawX = showItem.x;
        const delta = Math.abs(x - rawX);
        this.scene.tweens.add({
            targets: showItem,
            props: {
                x: x,
                y: y,
                alpha: alpha == undefined ? 1 : alpha,
            },
            duration: this.tweenTime,
            //Unified handling of display object depth
            onUpdate: (_tween, _target, key, cur, _previous) => {
                if (!this.depthMoved) {
                    if (key == "x") {
                        let posIdx = showItem.getData("pos");
                        if (posIdx != nextPropIdx) {
                            const curDelta = Math.abs(cur - rawX);
                            if (curDelta != 0 && curDelta >= delta / 2) {
                                const arr = this.getDepthArray();
                                arr.forEach((element) => {
                                    this.host.bringToTop(element.showItem);
                                });
                                this.depthMoved = true;
                            }
                        }
                    }
                }
            },
            onComplete: () => {
                if (this.isTween) {
                    this.checkNextMoveIdx(this.direction == SwiperDirection.Left);
                }
                this.isTween = false;
                showItem.setData("pos", nextPropIdx);
                if (!this.timeMoving) {
                    this.start();
                }
            },
        });
        //change the scale
        if (scale != undefined) {
            this.scene.tweens.addCounter({
                //@ts-ignore
                from: showItem.scale,
                to: scale,
                duration: this.tweenTime,
                onUpdate: (tween) => {
                    //@ts-ignore
                    showItem.setScale(tween.getValue());
                },
            });
        }
        //change the bright
        if (bright != undefined) {
            this.scene.tweens.addCounter({
                //@ts-ignore
                from: Number(showItem.getData("bright")),
                to: bright,
                duration: this.tweenTime,
                onUpdate: (tween) => {
                    const fx = showItem.getData("fx");
                    const bright = Number(tween.getValue());
                    //@ts-ignore
                    fx.brightness(bright);
                    showItem.setData("bright", bright);
                },
            });
        }
    }

    /**
     * start time event
     * @private
     */
    start() {
        this.timeMoving = true;
        const { scene, duration } = this;
        if (this.timeTicker) {
            scene.time.removeEvent(this.timeTicker);
        }
        scene.tweens.tweens.forEach((tween) => {
            tween.pause();
        });
        this.timeTicker = scene.time.addEvent({
            delay: duration,
            startAt: 0,
            loop: true,
            callback: () => {
                this.doMove(this.setDirection);
            },
        });
    }

    /**
     * clear the events of items
     * @private
     */
    stop() {
        const { scene, timeTicker } = this;
        if (timeTicker) {
            scene.time.removeEvent(timeTicker);
            this.timeTicker = null;
        }
        scene.tweens.tweens.forEach((tween) => {
            tween.stop();
            scene.tweens.remove(tween);
        });
    }

    /**
     *  layout of the display list
     * @private
     */
    resetItems() {
        const { host, showItems, propArr } = this;
        const arr = [];
        for (let i = 0; i < showItems.length; i++) {
            const item = showItems[i];
            const bindPosIdx = item.getData("pos");
            const bindProp = propArr[bindPosIdx];
            if (bindProp) {
                //@ts-ignore
                item.x = bindProp.x;
                //@ts-ignore
                item.y = bindProp.y;
                //@ts-ignore
                item.alpha = bindProp.alpha;
                //@ts-ignore
                item.scale = bindProp.scale;
                //@ts-ignore
                const fx = item.getData("fx");
                fx.brightness(bindProp.bright);
                item.setData("bright", bindProp.bright);
                arr.push({
                    item,
                    depth: bindProp.depth,
                });
            }
        }
        arr.sort((a, b) => {
            return a.depth - b.depth;
        });
        arr.forEach((item) => {
            host.bringToTop(item.item);
        });
        this.start();
    }
}
