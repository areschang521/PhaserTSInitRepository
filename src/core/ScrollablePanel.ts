import { GameObjects, Geom, Scene, Tweens } from "phaser";
import Scroller from "phaser3-rex-plugins/plugins/scroller";
import { GAME_HEIGHT, GAME_WIDTH } from "./Const";
import { CallbackInfo } from "./CallBackInfo";
export interface ScrollbalePanelOpt {
    scene: Scene;
    posRect: Geom.Rectangle;
    hGap?: number;
    vGap?: number;
    clz: { new (scene: Scene, x: number, y: number): ScrollableRender };
    layout: "x" | "y";
    datas?: any[];
    columnCount?: number;
    rowCount?: number;
    itemWidth: number;
    itemHeight: number;
    scrollCon: GameObjects.Container;
    con: GameObjects.Container;
    callback?: CallbackInfo<Function>;
}

export declare type ScrollableRender = GameObjects.GameObject & { x: number; y: number; datasource: any; updateItemData(data: any): any; setSelected?(flag: boolean): any };

export function getScrollablePanel(opt: ScrollbalePanelOpt) {
    const { scene, posRect, hGap, vGap, clz, layout, datas, columnCount, itemWidth, itemHeight, scrollCon, con, rowCount, callback } = opt;
    /**
     * @type {Tweens.Tween}
     */
    let tween: Tweens.Tween;
    let selectedIdx = -1;
    let scrollWidth = 0;
    let scrollHeight = 0;
    let bottomBound = 0;
    let _scale = 1;
    const cells: ScrollableRender[] = [];
    /**
     * data of the scrollable list
     */
    let listData = datas;

    const { x, y, width, height } = posRect;
    const tempRect = new Geom.Rectangle(0, 0, width, height);
    const maskContainRect = new Geom.Rectangle(x, y, width, height);

    const isHor = layout == "x";

    const len = isHor ? width : height;

    let cols = ~~columnCount;
    let rows = ~~rowCount;
    if (cols < 1) {
        if (isHor) {
            cols = Infinity;
        } else {
            cols = 1;
        }
    }
    if (rows < 1) {
        if (isHor) {
            rows = 1;
        } else {
            rows = Infinity;
        }
    }

    const topBound = isHor ? x : y;
    //init the mask graphics
    const listGraphics = scene.make.graphics();
    listGraphics.fillStyle(0xffffff);
    scene.add.existing(listGraphics);
    //create cells and mask
    create();
    //create scroller
    const scroller = new Scroller(scrollCon, {
        bounds: [bottomBound, topBound],
        value: topBound,
        orientation: isHor ? "horizontal" : "vertical",
        slidingDeceleration: 3000,
        backDeceleration: 2000,
        valuechangeCallback: (value) => {
            if (isHor) {
                con.x = value - GAME_WIDTH / 2;
            } else {
                con.y = value - GAME_HEIGHT / 2;
            }
            if (callback) {
                const all = topBound - bottomBound;
                const val = topBound - value;
                // callback.call(undefined, value / all);
                callback.call([val / all]);
            }
        },
    });
    // init the selected cell
    setSelectIndex(0);

    return {
        getPanel,
        onResize,
        /**
         * update data
         * it will reBuild the list
         */
        displayList,
        updateByIndex,
        getCell,
        moveTo,
        moveToStart,
        moveToEnd,
        moveToPos,
        setSelectIndex,
        removeAt,
    };

    /**
     * @param { number} idx
     * get cell of the scrollable list
     */
    function getCell(idx: number) {
        return cells?.[idx];
    }

    /**
     * get the scroll contant
     * @returns
     */
    function getPanel() {
        return con;
    }

    /**
     * create cells and mask
     */
    function create() {
        placeCells();

        scrollCon.setInteractive(new Geom.Rectangle(0, 0, width, height), Geom.Rectangle.Contains);

        const { x, y } = scrollCon.getWorldTransformMatrix().transformPoint(0, 0);
        listGraphics.fillRect(x, y, width, height);
        const maskPlayerList = listGraphics.createGeometryMask();
        con.mask = maskPlayerList;
        listGraphics.visible = false;
    }

    /**
     * check scroll contant bounds
     */
    function checkBounds() {
        const contentAll = isHor ? scrollWidth : scrollHeight;
        if (contentAll > len) {
            bottomBound = len - contentAll + topBound;
        } else {
            bottomBound = topBound;
        }
    }

    /**
     * create and place cells
     */
    function placeCells() {
        cells.length = 0;
        con.removeAll(true);
        if (listData?.length > 0) {
            listData.forEach((data) => {
                const cell = new clz(scene, 0, 0);
                cell.updateItemData(data);
                //@ts-ignore
                // cell.setScale(0.5);
                scene.add.existing(cell);
                cells.push(cell);
                con.add(cell);
            });
            reCalc();
        }
    }

    /**
     * @param {number} scale
     */
    function onResize(scale: number = 1) {
        const { x, y } = scrollCon.getWorldTransformMatrix().transformPoint(0, 0);
        listGraphics.clear();
        listGraphics.fillRect(x, y, width * scale, height * scale);
        maskContainRect.setPosition(x, y).setSize(width * scale, height * scale);
        const maskPlayerList = listGraphics.createGeometryMask();
        con.mask = maskPlayerList;
        _scale = scale;
    }

    /**
     * Refresh the view based on incoming datas
     */
    function displayList(datas: any[]) {
        listData = datas;
        placeCells();
        scroller.setBounds([bottomBound, topBound]);
        scroller.setValue(topBound);
        setSelectIndex(0);
    }

    /**
     * update date and view of the cell found by index
     */
    function updateByIndex(idx: number) {
        cells[idx]?.updateItemData(listData[idx]);
    }

    /**
     * set the cell selected by index
     */
    function setSelectIndex(idx: number, doTween = false) {
        if (clz.prototype.setSelected) {
            if (idx != selectedIdx) {
                const lastCell = cells[selectedIdx];
                if (lastCell) {
                    lastCell.setSelected(false);
                }
                const cell = cells[idx];
                if (cell) {
                    selectedIdx = idx;
                    cell.setSelected(true);
                }
            }

            //if the bounds of selected cell Unintersecting with the maskContainRect, move to the selected cell
            //Someone may select a cell again after scrolling the list after selecting it last time.
            //the detection logic must be executed every time
            const cell = cells[idx];
            if (cell) {
                const globalPos = (cell as any).getWorldTransformMatrix().transformPoint(0, 0);
                tempRect.setPosition(globalPos.x, globalPos.y).setSize(itemWidth * _scale, itemHeight * _scale);
                const result = Phaser.Geom.Rectangle.Intersection(tempRect, maskContainRect);
                if (!result.width && !result.height) {
                    moveTo(idx, doTween);
                }
            }
        }
    }

    /**
     * move to the start of the list
     */
    function moveToStart(doTween = false) {
        doMove(topBound, doTween);
    }

    /**
     * move to the end of the list
     */
    function moveToEnd(doTween = false) {
        doMove(bottomBound, doTween);
    }

    /**
     * move to the cell by index
     */
    function moveTo(idx: number, doTween = false) {
        const cell = cells[idx];
        if (cell) {
            let value = 0;
            if (isHor) {
                value = topBound - cell.x;
            } else {
                value = topBound - cell.y;
            }
            doMove(value, doTween);
        }
    }

    /**
     * move to the postion
     */
    function moveToPos(v: number) {
        const all = topBound - bottomBound;
        const val = topBound - v * all;
        doMove(val);
    }

    /**
     *
     */
    function doMove(value: number, doTween = false) {
        if (value > topBound) {
            value = topBound;
        }
        if (value < bottomBound) {
            value = bottomBound;
        }
        if (doTween) {
            if (tween) {
                tween.stop();
                tween = null;
            }
            tween = scene.tweens.addCounter({
                from: scroller.value,
                to: value,
                duration: 200,
                ease: "Sine.easeIn",
                onUpdate: (tween) => {
                    const value = Math.round(tween.getValue());
                    scroller.setValue(value);
                },
                onComplete: () => {
                    tween = null;
                },
            });
        } else {
            scroller.setValue(value);
        }
    }

    /**
     * remove cell by index
     */
    function removeAt(idx: number) {
        idx = idx >>> 0;
        if (idx < cells.length) {
            let cell = cells[idx];
            cells.splice(idx, 1);
            listData.splice(idx, 1);
            doRemoveCell(cell);
        }
    }

    /**
     * Actually delete the specified list object
     */
    function doRemoveCell(cell: ScrollableRender) {
        cell.destroy(true);
        reCalc();
        scroller.setBounds([bottomBound, topBound]);

        let value = scroller.value;
        if (value > topBound) {
            value = topBound;
        }
        if (value < bottomBound) {
            value = bottomBound;
        }

        scroller.setValue(value);
    }

    /**
     * replace cells postion and calculate contant bounds
     */
    function reCalc() {
        let maxWidth = 0,
            maxHeight = 0;
        if (cells?.length > 0) {
            let rowCount = cells.length / cols;
            let oy = 0,
                ox = 0;
            let i = 0;
            for (let r = 0; r <= rowCount; r++) {
                let lineMaxHeight = 0;
                for (let c = 0; c < cols; c++) {
                    if (i > cells.length - 1) {
                        break;
                    }
                    let w = 0;
                    if (itemWidth) {
                        w = itemWidth;
                    }
                    let vh: number;
                    if (itemHeight) {
                        vh = itemHeight;
                    }

                    const cell = cells[i];
                    cell.x = ox;
                    cell.y = oy;

                    let rright = ox + w;

                    if (maxWidth < rright) {
                        maxWidth = rright;
                    }
                    if (lineMaxHeight < vh) {
                        lineMaxHeight = vh;
                    }
                    ox += ~~hGap + w;
                    i++;
                }
                let mh = oy + lineMaxHeight;
                if (maxHeight < mh) {
                    maxHeight = mh;
                }
                if (i > listData.length - 1) {
                    break;
                }
                ox = 0;
                oy += ~~vGap + (itemHeight || lineMaxHeight);
            }
        }
        scrollWidth = maxWidth;
        scrollHeight = maxHeight;
        checkBounds();
    }
}

export declare type ScrollablePanel = ReturnType<typeof getScrollablePanel>;
