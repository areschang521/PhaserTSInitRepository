import { ButtonCreator } from "../core/Button";
import { CallbackInfo } from "../core/CallBackInfo";
import { LayoutType } from "../core/Layout";
import { MainUIContainer } from "../core/MainUIContainer";

export class MyScene extends Phaser.Scene {
    isTweening = false;
    iceContainer: Phaser.GameObjects.Container;
    ices: Phaser.GameObjects.Group;
    now: number;
    originImg: Phaser.GameObjects.Image;
    posTF: Phaser.GameObjects.Text;
    bg: Phaser.GameObjects.Image;
    con: MainUIContainer;
    constructor() {
        super({
            key: "my-scene",
        });
    }

    preload() {

        this.load.image("myImg", "assets/spookysky.png");
        this.load.image("gem1", "assets/gem1.png");
        this.load.image("gem2", "assets/gem2.png");
        this.load.image("gem3", "assets/gem3.png");
        this.load.image("gem4", "assets/gem4.png");
        this.load.image("gem5", "assets/gem5.png");
        this.load.image("gem6", "assets/gem6.png");
        this.load.image("gem7", "assets/gem7.png");
        this.load.image("gem8", "assets/gem8.png");
        this.load.image("gem9", "assets/gem9.png");
        this.load.image("block-ice", "assets/block-ice.png");
        this.load.image("btnBg", "assets/button-bg.png");
        this.load.image("BtnTF", "assets/button-text.png");
        this.load.spritesheet("invader2", "assets/invader2.png", { frameWidth: 44, frameHeight: 32 })
    }

    create() {
        let con = this.con = new MainUIContainer(this, null, { width: 2000, height: 1000 });
        const { add, lights, input, scale: { width, height }, tweens, time, cameras } = this;
        this.bg = add.image(400, 300, "myImg").setPipeline("Light2D");
        let btn = ButtonCreator(this, 400, 300, "invader2", 0, 1, CallbackInfo.get(() => {
            console.log(`按钮点击`);
            this.scene.start('MainMenu');
        }));
        btn.scale = 2;
        this.originImg = add.image(0, 0, "block-ice");
        // this.originImg.Text
        const invader2 = add.group([
            { key: 'invader2', frame: 0, repeat: 10, setXY: { x: 32, y: 148, stepX: 52 }, setRotation: { value: 0, step: 0.1 } },
            { key: 'invader2', frame: 0, repeat: 10, setXY: { x: 32, y: 148 + 48, stepX: 52 }, setRotation: { value: 0, step: -0.1 } }
        ] as Phaser.Types.GameObjects.Group.GroupCreateConfig[]);
        con.add(this.bg, LayoutType.TOP_RIGHT)
        Phaser.Actions.IncX(invader2.getChildren(), 100);
        Phaser.Actions.SetTint(invader2.getChildren(), 0x00ff00);
        this.lights.enable().setAmbientColor(0x555555);
        const spotLight = lights.addLight(0, 0, 200).setIntensity(2);
        this.posTF = this.add.text(0, 0, 'MousePostion').setScrollFactor(0).setColor('#ff0000');
        // const { rawZoom } = cameras.main;
        input.on('pointermove', (pointer: { x: number; y: number; }) => {
            const { x, y } = pointer;
            let zoom = cameras.main.zoom;
            let deltaH = (width / zoom - width) >> 1;
            let deltaV = (height / zoom - height) >> 1;
            spotLight.x = x / zoom - deltaH;
            spotLight.y = y / zoom - deltaV;
            this.posTF.setText(`MousePostion-----x:${~~spotLight.x} y:${~~spotLight.y}`);
        });
        const con1 = add.container(400, 400);
        con1.width = con1.height = 8000;
        const con2 = add.container(400, 400);
        con2.width = con2.height = 8000;
        con.add(con1, LayoutType.MIDDLE_CENTER)
        con.add(con2, LayoutType.MIDDLE_CENTER)
        const circle = new Phaser.Geom.Circle(0, 0, 10000);
        const rings = [
            {
                radius: 100,
                points: 4,
                color: 0xff22ff,
                frame: 'gem1'
            },
            {
                radius: 300,
                points: 10,
                color: 0xff22ff,
                frame: 'gem2'
            },
            {
                radius: 500,
                points: 15,
                color: 0x61cd6b,
                frame: 'gem3'
            },
            {
                radius: 700,
                points: 20,
                color: 0xc7860f,
                frame: 'gem4'
            },
            {
                radius: 900,
                points: 25,
                color: 0xeae90a,
                frame: 'gem5'
            },
            {
                radius: 1100,
                points: 30,
                color: 0xd61837,
                frame: 'gem7'
            },
            {
                radius: 1300,
                points: 35,
                color: 0x42b3ee,
                frame: 'gem1'
            },
            {
                radius: 1500,
                points: 40,
                color: 0x9a5baa,
                frame: 'gem6'
            },
            {
                radius: 1700,
                points: 45,
                color: 0x65a0b3,
                frame: 'gem8'
            },
            {
                radius: 1900,
                points: 50,
                color: 0x0771d2,
                frame: 'gem9'
            }
        ];

        for (let i = 0; i < rings.length; i++) {
            let ring = rings[i];
            let layer = i % 2 ? con1 : con2;
            circle.setTo(400, 400, ring.radius);

            let points = Phaser.Geom.Circle.GetPoints(circle, ring.points);
            points.forEach(point => {
                let gem = add.image(point.x - 400, point.y - 400, ring.frame)
                layer.add(gem);
                tweens.add({
                    targets: [gem],
                    angle: layer == con1 ? 360 : -360,
                    repeat: -1,
                    duration: 3000
                });
            });
        }

        // tweens.add({
        //     targets: [con1, con2],
        //     scale: .5,
        //     repeat: -1,
        //     duration: 3000,
        //     yoyo: true
        // })

        input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: any, deltaY: number) => {
            if (deltaY < 0) {
                con1.scale += 0.1;
                con2.scale += 0.1;
            }
            else if (deltaY > 0) {
                con1.scale -= 0.1;
                con2.scale -= 0.1;
            }
            let zoom = cameras.main.zoom;
            let deltaH = (width / zoom - width) >> 1;
            let deltaV = (height / zoom - height) >> 1;
            this.posTF.setPosition(-deltaH, -deltaV);
            this.posTF.setScale(1 / this.cameras.main.zoom);
        });

        tweens.add({ targets: con1, angle: 360, duration: 15000, repeat: -1 });
        tweens.add({ targets: con2, angle: -360, duration: 30000, repeat: -1 });
        time.addEvent({
            delay: 1000,
            callback: this.onEvent,
            callbackScope: this,
            loop: true
        });
    }

    onEvent() {
        const child = this.children.getRandom();
        if (child) {
            (child as Phaser.GameObjects.Image).preFX
        }
    }


    update(_delta: number) {
        this.originImg.setPosition(0, 0);
    }

    myTestFunc(a: number, b: number) {
        return a + b;
    }

}