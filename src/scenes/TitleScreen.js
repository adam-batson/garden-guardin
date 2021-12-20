import Phaser from 'phaser';

export default class TitleScreen extends Phaser.Scene
{
    preload()
    {

    }

    create()
    {
        this.add.text(400, 400, 'Press SPACE to start');

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('level-one');
        });
    }
}