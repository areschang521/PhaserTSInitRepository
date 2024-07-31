import { GameObjects, Scene } from 'phaser';
import { getFixedLayout, MainUIContainer } from '../core/MainUIContainer';
import { Layout, LayoutType } from '../core/Layout';
export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    con: MainUIContainer;
    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image("gem2", "assets/gem2.png");
        this.load.image("wow", "assets/wise.jpg");
    }

    create() {
        let con = this.con = new MainUIContainer(this.game.scale, this);

        this.background = this.add.image(0, 0, 'wow').setOrigin(0, 0);
        con.add(this.background, LayoutType.TOP_LEFT)
        this.logo = this.add.image(320, 160, 'logo').setOrigin(.5, .5);
        con.add(this.logo, LayoutType.MIDDLE_CENTER)
        let gem1 = this.add.image(0, 0, 'gem2').setOrigin(0, 0).setScale(.5);
        let gem2 = this.add.image(640, 0, 'gem2').setOrigin(1, 0).setScale(.5);
        let gem3 = this.add.image(0, 320, 'gem2').setOrigin(0, 1).setScale(.5);
        let gem4 = this.add.image(640, 320, 'gem2').setOrigin(1, 1).setScale(.5);
        let gem5 = this.add.image(320, 0, 'gem2').setOrigin(.5, 0).setScale(.5);
        let gem6 = this.add.image(640, 160, 'gem2').setOrigin(1, .5).setScale(.5);
        let gem7 = this.add.image(320, 320, 'gem2').setOrigin(.5, 1).setScale(.5);
        let gem8 = this.add.image(0, 160, 'gem2').setOrigin(0, .5).setScale(.5);
        con.add(gem1, LayoutType.TOP_LEFT)
        con.add(gem2, LayoutType.TOP_RIGHT)
        con.add(gem3, LayoutType.BOTTOM_LEFT)
        con.add(gem4, LayoutType.BOTTOM_RIGHT)
        con.add(gem5, LayoutType.TOP_CENTER)
        con.add(gem6, LayoutType.MIDDLE_RIGHT)
        con.add(gem7, LayoutType.BOTTOM_CENTER)
        con.add(gem8, LayoutType.MIDDLE_LEFT)
        this.title = this.add.text(320, 200, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        con.add(this.title, LayoutType.TOP_RIGHT)

        this.input.once('pointerdown', () => {

            this.scene.start('my-scene');

        });
        con.on("mainUI_Resize", this.onResize, this);
        this.onResize();
    }

    testFunction(a: number, b: number) {
        return a + b;
    }

    testCreateGameObject() {
        return this.add.text(512, 460, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
    }

    onResize() {
        // let basis = this.scale;
        // let sw = window.innerWidth, sh = window.innerHeight, bw = 640, bh = 320;
        // let result = getFixedLayout(sw, sh, bw, bh);
        // let dh = result.dh;
        // let dw = result.dw;
        // let scale = result.scale;
        // // if (scale > 1) {
        // //     this.background.scaleX = this.background.scaleY = scale;
        // //     let pt = { x: 0, y: 0 };
        // //     Layout.getLayoutPos(dw, dh, sw, sh, LayoutType.TOP_LEFT, pt);
        // //     this.background.x = pt.x;
        // //     this.background.y = pt.y;
        // // }
        // if (scale >= 1) {
        //     this.background.scaleX = this.background.scaleY = scale;

        // } else {
        //     let zoomX = sw / bw
        //     let zoomY = sh / bh;
        //     let zoom = Math.min(zoomX, zoomY);
        //     this.background.scaleX = this.background.scaleY = zoom
        // }
        // let pt = { x: 0, y: 0 };
        // Layout.getLayoutPos(dw, dh, sw, sh, LayoutType.TOP_LEFT, pt);
        // this.background.x = pt.x;
        // this.background.y = pt.y;
    }
}
