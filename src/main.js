import Phaser from 'phaser';
import Game from './scenes/Game';
import Preload from './scenes/Preload';
import TitleScreen from './scenes/TitleScreen';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
};

const game = new Phaser.Game(config);

game.scene.add('preload', Preload);
game.scene.add('title-screen', TitleScreen);
game.scene.add('game', Game);

game.scene.start('preload');