import { GameObjects } from "phaser";
import { game } from "../main";
import { EventConst } from "../EventConst";

export class Slider {
    scene: Phaser.Scene;
    /**
     * @type {GameObjects.Image}
     * @private
     */
    thumb: GameObjects.Image;
    /**
     * @type {GameObjects.Image}
     * @private
     */
    bar: GameObjects.Image;
    /**
     * @type {GameObjects.Image}
     * @private
     */
    bg: GameObjects.Image;
    /**
     * minValue
     * @type {number}
     * @private
     */
    min: number;
    /**
     * maxValue
     * @type {number}
     * @private
     */
    max: number;
    /**
     * @type {number}
     * @private
     */
    progressAll: number;
    /**
     * @type {boolean}
     * @private
     */
    isHorizon: boolean;
    /**
     * current value
     * @type {number}
     * @private
     */
    curValue: number;
    /**
     * @type {GameObjects.Container}
     */
    container: GameObjects.Container;
    /**
     * @type {boolean}
     */
    dragging: boolean;
    /**
     * original width/height
     * @type {number}
     * @private
     */
    rawBarDistance: number;

    /**
     * @param {Phaser.Scene} scene
     * @param {string} layout
     * @param {GameObjects.Container} con
     */
    constructor(scene: Phaser.Scene, con: GameObjects.Container, layout: "x" | "y") {
        this.scene = scene;
        this.container = con;
        this.isHorizon = layout == "x";
    }

    /**
     * set thumb/bar/bg
     * @param {GameObjects.Image} thumb
     * @param {GameObjects.Image} bar
     * @param {GameObjects.Image} bg
     */
    setSkin(thumb: GameObjects.Image, bar: GameObjects.Image, bg: GameObjects.Image) {
        this.thumb = thumb;
        this.bar = bar;
        this.bg = bg;
        const { width, height, scaleX, scaleY } = bg;
        const { width: barWidth, height: barHeight } = bar;
        if (this.isHorizon) {
            this.progressAll = width * scaleX;
            this.rawBarDistance = barWidth;
        } else {
            this.progressAll = height * scaleY;
            this.rawBarDistance = barHeight;
        }
        thumb.setInteractive({ draggable: true });
        thumb.on(Phaser.Input.Events.DRAG, this.onThumbBegin, this);
    }

    /**
     * set if click bg can change the value by pointer
     * @param {boolean} v
     */
    setBgClickEnable(v: boolean) {
        const { bg } = this;
        if (!bg) {
            return;
        }
        if (v) {
            bg.setInteractive();
            bg.on(Phaser.Input.Events.POINTER_DOWN, this.onBgClick, this);
        }
    }

    /**
     * @param {{ x: number; y: number; }} pointer
     */
    onBgClick(pointer: Phaser.Input.Pointer) {
        this.onThumbBegin(pointer);
        //after update postion logic,need to make dragging to be false
        this.onTouchEnd();
    }

    /**
     * @param {{ x: number; y: number; }} pointer
     */
    onThumbBegin({ x, y }: { x: number; y: number }) {
        this.dragging = true;

        this.addThumbEvents();

        this.updatePos(x, y);
    }

    onTouchEnd() {
        this.removeThumbEvents();

        this.dragging = false;
    }

    /**
     * @param {number} dragX
     * @param {number} dragY
     */
    updatePos(dragX: number, dragY: number) {
        const { progressAll, min, max, isHorizon } = this;
        const { x, y } = this.container.getLocalPoint(dragX, dragY);
        const dragPos = isHorizon ? x : y;
        const value = (dragPos / progressAll) * (max - min);
        this.setValue(value);
    }

    /**
     * set min and max value
     * @param {number} min
     * @param {number} max
     */
    setMinAndMax(min: number, max: number) {
        if (min > max) {
            min = max;
        }
        this.min = min;
        this.max = max;
    }

    /**
     * update current value and move the thumb postion,change the bar width/height
     * @param {number} v
     */
    setValue(v: number) {
        const { min, max, progressAll, rawBarDistance, bar, thumb, isHorizon } = this;
        const { originX, originY, x: bgX, y: bgY } = this.bg;
        v = Phaser.Math.Clamp(v, min, max);
        const startX = bgX - originX * progressAll;
        const startY = bgY - originY * progressAll;
        if (this.curValue != v) {
            this.curValue = v;
            game.events.emit(EventConst.ValueChange, this, v);
            const distance = (v / (max - min)) * progressAll;
            let pos = 0;
            if (isHorizon) {
                pos = startX + distance;
            } else {
                pos = startY + distance;
            }
            pos = Phaser.Math.Clamp(0, pos, progressAll);
            if (isHorizon) {
                thumb.x = pos;
            } else {
                thumb.y = pos;
            }
            if (bar) {
                const barDistance = distance / rawBarDistance;
                if (isHorizon) {
                    bar.scaleX = barDistance;
                } else {
                    bar.scaleY = barDistance;
                }
            }
        }
    }

    /**
     * get current value
     * @returns
     */
    getValue() {
        return this.curValue;
    }

    /**
     * add events when thumb dragging
     */
    addThumbEvents() {
        const { thumb } = this;
        thumb.on(Phaser.Input.Events.DRAG_END, this.onTouchEnd, this);
        thumb.on(Phaser.Input.Events.DRAG_LEAVE, this.onTouchEnd, this);
    }
    /**
     * remove events after thumb drag
     */
    removeThumbEvents() {
        const { thumb } = this;
        thumb.off(Phaser.Input.Events.DRAG, this.onTouchEnd, this);
        thumb.off(Phaser.Input.Events.DRAG_END, this.onTouchEnd, this);
        thumb.off(Phaser.Input.Events.DRAG_LEAVE, this.onTouchEnd, this);
    }
}
