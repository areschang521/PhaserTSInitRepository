import { CallbackInfo } from "./CallBackInfo";

export function ButtonCreator(scene: Phaser.Scene, x: number, y: number, sheetName: string, frame_0: number, frame_1: number, clickHandler?: CallbackInfo<Function>) {
    let defaultScale = 1;
    let con = new Phaser.GameObjects.Container(scene, x, y);
    scene.add.existing(con);
    let button = new Phaser.GameObjects.Sprite(scene, 0, 0, sheetName);
    con.add(button);
    let text = new Phaser.GameObjects.Text(scene, 0, 0, 'Click me', { fontFamily: 'Arial', fontSize: '20px', color: '#000000' });
    con.add(text);
    text.text = ``;
    con.width = button.width;
    con.height = button.height;
    con.setInteractive();
    con.on('pointerdown', () => {
        clickHandler?.execute();
        onTouchDown();
    });
    con.on('pointerup', () => {
        onTouchEnd();
    });
    con.on('pointerout', () => {
        onTouchEnd();
    });
    return {
        display: con,
        set enable(b: boolean) {
            if (b) {
                button.setInteractive();
            } else {
                button.disableInteractive();
            }
            button.setTint(b ? 0xffffff : 0x808080);
        },
        set label(str: string) {
            text.text = str;
        },
        set scale(s: number) {
            con.setScale(s);
            defaultScale = s;
        }

    };

    function onTouchDown() {
        button.setFrame(frame_1);
        scene.add.tween({
            targets: con,
            duration: 100,
            ease: 'Linear',
            repeat: 0,
            scaleX: 0.9 * defaultScale,
            scaleY: 0.9 * defaultScale,
        });
    }

    function onTouchEnd() {
        button.setFrame(frame_0);
        scene.add.tween({
            targets: con,
            duration: 100,
            ease: 'Linear',
            repeat: 0,
            scaleX: 1 * defaultScale,
            scaleY: 1 * defaultScale,
        });
    }
}

export declare type Button = ReturnType<typeof ButtonCreator>;