import Phaser from 'phaser';

export default class GameOver extends Phaser.Scene
{
    create()
    {       
        this.time.delayedCall(1000, () => {
            this.add.text(400, 250, "Game Over")
                .setOrigin(0.5, 0.5)
                .setFontFamily('game-font')
                .setFontSize(40);
            this.add.text(400, 400, 'Press SPACE to restart')
                .setOrigin(0.5, 0.5)
                .setFontFamily('game-font')
                .setFontSize(32);
        });

         // Pressing start will begin the fade out.
         this.input.keyboard.once('keydown-SPACE', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
        });

        // Fades out to transition to gameplay.
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start('preload');
        });
    }
}