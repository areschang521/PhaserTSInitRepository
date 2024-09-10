import { GameObjects, Scene } from "phaser";
import { MainUIContainer } from "../core/MainUIContainer";
import { LayoutType } from "../core/Layout";
import { CenterObjectContainer } from "../core/CenterObjectContainer";
import { BgContainer } from "../core/BgContainer";
export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    con: MainUIContainer;
    centerCon: CenterObjectContainer;
    bgCon: BgContainer;
    testBg: GameObjects.Image;
    constructor() {
        super("MainMenu");
    }

    preload() {
        this.load.image("gem2", "assets/gem2.png");
        this.load.image("wow", "assets/wise.jpg");
        this.load.image("earth", "assets/earth.jpg");
    }

    create() {
        let con = (this.con = new MainUIContainer(this));
        this.testBg = this.add.image(0, 0, "wow").setOrigin(0, 0);
        const bgCon = (this.bgCon = new BgContainer(this));
        bgCon.add(this.testBg, LayoutType.MIDDLE_CENTER);
        this.background = this.add.image(960, 540, "earth").setOrigin(0.5, 0.5);
        let bk1 = this.add.image(860, 440, "earth").setOrigin(0.5, 0.5);
        let centerCon = (this.centerCon = new CenterObjectContainer(this));
        centerCon.add(this.background, LayoutType.MIDDLE_CENTER, { x: 0, y: 0 }, true);
        centerCon.add(bk1, LayoutType.MIDDLE_CENTER, { x: 0, y: 0 }, true);
        this.logo = this.add.image(960, 320, "logo").setOrigin(0.5, 0.5);
        con.add(this.logo, LayoutType.MIDDLE_CENTER);
        let gem1 = this.add.image(0, 0, "gem2").setOrigin(0, 0).setScale(0.5);
        let gem2 = this.add.image(1920, 0, "gem2").setOrigin(1, 0).setScale(0.5);
        let gem3 = this.add.image(0, 1080, "gem2").setOrigin(0, 1).setScale(0.5);
        let gem4 = this.add.image(1920, 1080, "gem2").setOrigin(1, 1).setScale(0.5);
        let gem5 = this.add.image(960, 0, "gem2").setOrigin(0.5, 0).setScale(0.5);
        let gem6 = this.add.image(1920, 540, "gem2").setOrigin(1, 0.5).setScale(0.5);
        let gem7 = this.add.image(960, 1080, "gem2").setOrigin(0.5, 1).setScale(0.5);
        let gem8 = this.add.image(0, 540, "gem2").setOrigin(0, 0.5).setScale(0.5);
        con.add(gem1, LayoutType.TOP_LEFT);
        con.add(gem2, LayoutType.TOP_RIGHT);
        con.add(gem3, LayoutType.BOTTOM_LEFT);
        con.add(gem4, LayoutType.BOTTOM_RIGHT);
        con.add(gem5, LayoutType.TOP_CENTER);
        con.add(gem6, LayoutType.MIDDLE_RIGHT);
        con.add(gem7, LayoutType.BOTTOM_CENTER);
        con.add(gem8, LayoutType.MIDDLE_LEFT);
        this.title = this.add
            .text(960, 540, "Main Menu", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5);
        con.add(this.title, LayoutType.TOP_RIGHT);

        this.input.once("pointerdown", () => {
            // this.scene.start('my-scene');
            this.scene.start("ScrollScene");
        });
    }

    testFunction(a: number, b: number) {
        return a + b;
    }

    testCreateGameObject() {
        return this.add
            .text(640, 360, "Main Menu", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5);
    }
}
