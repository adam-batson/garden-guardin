import Phaser from 'phaser';
import Game from './scenes/Game';
import Preload from './scenes/Preload';
import TitleScreen from './scenes/TitleScreen';
import GameOver from './scenes/GameOver';
import YouWin from './scenes/YouWin';

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
            debug: false,
            gravity: { y: 0 }
        }
    }
};

const game = new Phaser.Game(config);

game.scene.add('preload', Preload);
game.scene.add('title-screen', TitleScreen);
game.scene.add('game', Game);
game.scene.add('lose', GameOver);
game.scene.add('win', YouWin);

game.scene.start('preload');