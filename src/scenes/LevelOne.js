import Phaser from 'phaser';
import images from '../assets/images/garden.png';

export default class LevelOne extends Phaser.Scene
{
    preload()
    {
        this.load.image('garden', images)
    }
    create()
    {
        this.add.image(400, 400, 'garden')
        this.add.rectangle(400, 400, 20, 20, 0xffffff, 1);
    }
}