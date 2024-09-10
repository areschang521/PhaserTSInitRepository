import { MainUIContainer } from "./core/MainUIContainer";
import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { MyScene } from "./scenes/MyScene";
import { Preloader } from "./scenes/Preloader";
import { registerExtends } from "./core/Extends";

import { Game, Types } from "phaser";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import ScrollScene from "./scenes/ScrollScene";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: "game-container",
    backgroundColor: "#000000",
    autoRound: true,
    // resizeInterval:100,
    scale: {
        mode: Phaser.Scale.ScaleModes.RESIZE, //横屏用5
        // mode: 6,//竖屏用6

        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    plugins: {
        scene: [
            {
                key: "rexUI",
                plugin: UIPlugin,
                mapping: "rexUI",
            },
            // ...
        ],
    },
    scene: [Boot, Preloader, MainMenu, MainGame, GameOver, MyScene, ScrollScene],
};

registerExtends();
export var game = new Game(config);
