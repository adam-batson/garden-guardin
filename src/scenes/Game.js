import Phaser from 'phaser';

export default class Game extends Phaser.Scene
{
    init()
    {
        pestsLeft = 100;
        lives = 3;
    }
    preload()
    {
        // The player sprite will follow the mouse cursor.
        // This removes the arrow from the cursor.
        this.sys.canvas.style.cursor = 'none';
    }
    create()
    {
        var pestsLeft = 100;
        var lives = 3;

        this.add.image(400, 400, 'garden');
        this.player = this.add.sprite(400, 400, 'player');
        
        //Add sounds
        const swingSound = this.sound.add('swing');
        console.log(swingSound)
        const bgm = this.sound.add('bgm', { loop: true });
        bgm.play();

        this.add.text(400, 30, "Pests: " + pestsLeft)
            .setOrigin(0.5, 0.5)    
            .setFontFamily('game-font')
            .setFontSize(24);

        // Fades in to allow player to begin.
        this.cameras.main.fadeIn(500, 0, 0, 0);
        
        // Allows clicking to change the animation.
        // Animation resets when not clicking.
        this.input.on('pointerdown', () => { 
            this.player.play('Attacking', true);
            swingSound.play();
            });
        this.input.on('pointerup', () => { 
            this.player.play('Resting', false)});

        while (pestsLeft < 100 && pestsLeft > 80)
            {
                aphidSpawn();
            }
    }
    update()
    {
        // Moves player spade wherever the mouse moves.        
        this.player.x = this.input.activePointer.worldX;
        this.player.y = this.input.activePointer.worldY;
    }

    aphidSpawn() {
        // X will be either 0 or 800, forcing spawns from
        // the edge of the screen.
        spawnX = Phaser.Math.RND.between(0,1) * 800;
        spawnY = Phaser.Math.RND(0, 800);
        //TODO
        this.add.group()
        
    }
}