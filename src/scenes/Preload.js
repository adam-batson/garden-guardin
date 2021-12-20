import Phaser from 'phaser';
import garden from '../assets/images/garden.png';
//import 

export default class Preload extends Phaser.Scene
{
    preload()
    {
        this.load.image('garden', garden);
    }
    create()
    {
        this.scene.start('title-screen');
    }
}