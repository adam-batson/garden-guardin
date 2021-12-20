import Phaser from 'phaser';

export default class LevelOne extends Phaser.Scene
{
    preload()
    {
    }
    create()
    {
        this.add.image(400, 400, 'garden')
        this.add.rectangle(400, 400, 20, 20, 0xffffff, 1);
    }
}