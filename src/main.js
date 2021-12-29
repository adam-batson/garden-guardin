import Phaser from 'phaser';
import Game from './scenes/Game';
import Preload from './scenes/Preload';
import TitleScreen from './scenes/TitleScreen';

// Plugins.

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 0 }
        }
    }
};

const game = new Phaser.Game(config);

game.scene.add('preload', Preload);
game.scene.add('title-screen', TitleScreen);
game.scene.add('game', Game);

game.scene.start('preload');