import Phaser from 'phaser';

export default class TitleScreen extends Phaser.Scene
{
    preload()
    {
    }

    create()
    {   
        this.time.delayedCall(500, () => {
            this.add.text(400, 250, "Garden Guardin'")
                .setOrigin(0.5, 0.5)
                .setFontFamily('game-font')
                .setFontSize(40);
            this.add.text(400, 400, 'Click or Tap to start')
                .setOrigin(0.5, 0.5)
                .setFontFamily('game-font')
                .setFontSize(32);
        });

        // Pressing start will begin the fade out.
        this.input.once('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
        });

        // Fades out to transition to gameplay.
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('game');
        });
    }
}