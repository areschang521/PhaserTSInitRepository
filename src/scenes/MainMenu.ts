import { GameObjects, Scene } from 'phaser';
import { getFixedLayout, MainUIContainer } from '../core/MainUIContainer';
import { Layout, LayoutType } from '../core/Layout';
import { CenterObjectContainer } from '../core/CenterObjectContainer';
import { BgContainer } from '../core/BgContainer';
export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    con: MainUIContainer;
    centerCon: CenterObjectContainer;
    bgCon: BgContainer
    testBg: GameObjects.Image;
    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.image("gem2", "assets/gem2.png");
        this.load.image("wow", "assets/wise.jpg");
        this.load.image("earth", "assets/earth.jpg");
    }

    create() {
        let con = this.con = new MainUIContainer(this, null, { width: 2000, height: 1000 });
        this.testBg = this.add.image(0, 0, "wow").setOrigin(0, 0);
        this.bgCon = new BgContainer(this, null, this.testBg, { width: 2000, height: 1000 });
        this.background = this.add.image(540, 320, 'earth').setOrigin(.5, .5);
        this.centerCon = new CenterObjectContainer(this.background, this, null, this.background, { width: 2000, height: 1000 }, LayoutType.MIDDLE_CENTER, true);
        this.logo = this.add.image(540, 320, 'logo').setOrigin(.5, .5);
        con.add(this.logo, LayoutType.MIDDLE_CENTER);
        let gem1 = this.add.image(0, 0, 'gem2').setOrigin(0, 0).setScale(.5);
        let gem2 = this.add.image(1080, 0, 'gem2').setOrigin(1, 0).setScale(.5);
        let gem3 = this.add.image(0, 640, 'gem2').setOrigin(0, 1).setScale(.5);
        let gem4 = this.add.image(1080, 640, 'gem2').setOrigin(1, 1).setScale(.5);
        let gem5 = this.add.image(540, 0, 'gem2').setOrigin(.5, 0).setScale(.5);
        let gem6 = this.add.image(1080, 320, 'gem2').setOrigin(1, .5).setScale(.5);
        let gem7 = this.add.image(540, 640, 'gem2').setOrigin(.5, 1).setScale(.5);
        let gem8 = this.add.image(0, 320, 'gem2').setOrigin(0, .5).setScale(.5);
        con.add(gem1, LayoutType.TOP_LEFT)
        con.add(gem2, LayoutType.TOP_RIGHT)
        con.add(gem3, LayoutType.BOTTOM_LEFT)
        con.add(gem4, LayoutType.BOTTOM_RIGHT)
        con.add(gem5, LayoutType.TOP_CENTER)
        con.add(gem6, LayoutType.MIDDLE_RIGHT)
        con.add(gem7, LayoutType.BOTTOM_CENTER)
        con.add(gem8, LayoutType.MIDDLE_LEFT)
        this.title = this.add.text(540, 350, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
        con.add(this.title, LayoutType.TOP_RIGHT)

        this.input.once('pointerdown', () => {

            this.scene.start('my-scene');

        });
    }

    testFunction(a: number, b: number) {
        return a + b;
    }

    testCreateGameObject() {
        return this.add.text(640, 360, 'Main Menu', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);
    }
}
