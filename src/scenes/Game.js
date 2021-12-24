import Phaser from 'phaser';

export default class Game extends Phaser.Scene
{
    init()
    {
        this.pestsLeft = 100;
        this.lives = 3;

        this.initPlayer();
    }
    preload()
    {
        // The player sprite will follow the mouse cursor.
        // This removes the arrow from the cursor.
        this.sys.canvas.style.cursor = 'none';
    }
    create()
    {
        this.add.image(400, 400, 'garden')
            .setDepth(0);
        this.player = this.add.sprite(400, 400, 'player')
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        //Add sounds
        const swingSound = this.sound.add('swing');
        console.log(swingSound)
        const bgm = this.sound.add('bgm', { loop: true });
        bgm.play();

        this.add.text(400, 30, "Pests: " + this.pestsLeft)
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

        this.aphidGroup = this.add.group({ maxSize: 10 });
        
        this.wave = 3
        this.aphidSpawn();


    }

    update()
    {
        this.playerMove();
    }

    initPlayer()
    {
        // Moves mouse pointer to center screen.
        // Without this, the player doesn't visibly
        // spawn until the mouse is moved.
        this.input.activePointer.worldX = 400;
        this.input.activePointer.worldY = 400;
    }

    playerMove()
    {
        // Moves player spade wherever the mouse moves.        
        this.player.x = this.input.activePointer.worldX;
        this.player.y = this.input.activePointer.worldY;
    }

    enemyMove()
    {
        aphidTween = this.tweens.add({
            targets: this.aphidGroup.getChildren(),
            
        });
    }

    aphidSpawn() {
        var num;
        var active = this.aphidGroup.countActive();
        
        switch (this.wave) {
            case 1:
                num = 20;
                break;
            case 3:
                num = 5;
                break;
            case 4:
                num = 10;
                break;
            default:
                num = 0;
                break;
        }
        if(active < (num / 2))
        {
            for(let i = 0; i <= (num / 2); i++)
            {
                let x = Phaser.Math.RND.between(0, 1) * 800;
                let y = this.randomCoordinate();
                
                let aphid = this.add.sprite(x, y, 'aphid')
                    .setOrigin(0.5, 0.5)
                    .setDepth(1)
                    .play({
                        key: 'Walking',
                        repeat: -1
                     });
                aphid.enemyMove();

                this.aphidGroup.add(aphid, true);                                   
            }
        }
            
    }

    randomCoordinate() // Chooses which height to spawn at, could emerge from offscreen top or bottom as well.
    {
        return Phaser.Math.RND.between(-32, 832);
    }








}