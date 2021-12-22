import Phaser from 'phaser';

export default class TitleScreen extends Phaser.Scene
{
    preload()
    {

    }

    create()
    {
        this.add.text(400, 250, "Garden Guardin'")
            .setOrigin(0.5, 0.5)
            .setFontFamily('game-font')
            .setFontSize(40);
        this.add.text(400, 400, 'Press SPACE to start')
            .setOrigin(0.5, 0.5)
            .setFontFamily('game-font')
            .setFontSize(32);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('level-one');
        });
    }
}