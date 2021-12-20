import Phaser from 'phaser';
import * as images from '../assets/images/*.png';
import sprite from '../assets/images/Spade.json';

export default class Preload extends Phaser.Scene
{
    preload()
    {
        this.load.image('garden', images);
        this.load.aseprite('player', images.Spade, sprite);
    }
    create()
    {
        this.scene.start('title-screen');
    }
}