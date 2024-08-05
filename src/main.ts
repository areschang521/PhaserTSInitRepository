import { MainUIContainer } from './core/MainUIContainer';
import { Boot } from './scenes/Boot';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { MyScene } from './scenes/MyScene';
import { Preloader } from './scenes/Preloader';

import { Game, Types } from "phaser";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 640,
    height: 320,
    parent: 'game-container',
    backgroundColor: '#028af8',
    autoRound: true,
    // resizeInterval:100,
    scale: {
        mode: Phaser.Scale.ScaleModes.RESIZE,//横屏用5
        // mode: 6,//竖屏用6

        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver,
        MyScene
    ]
};

export var game = new Game(config);
