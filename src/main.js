import Phaser from 'phaser';
import LevelOne from './scenes/LevelOne';
import Preload from './scenes/Preload';
import TitleScreen from './scenes/TitleScreen';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800
};

const game = new Phaser.Game(config);

game.scene.add('preload', Preload);
game.scene.add('title-screen', TitleScreen);
game.scene.add('level-one', LevelOne);

//game.scene.start('level-one');

//game.scene.start('title-screen');
game.scene.start('preload');