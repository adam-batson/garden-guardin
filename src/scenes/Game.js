import Phaser from 'phaser';
import RotateTo from 'phaser3-rex-plugins/plugins/rotateto';
import Clock from 'phaser3-rex-plugins/plugins/clock.js';
import MoveTo from 'phaser3-rex-plugins/plugins/moveto.js';

export default class Game extends Phaser.Scene
{
    init()
    {
        this.pestsLeft = 100;
        this.lives = 3;
        this.initPlayer();
        this.clock = new Clock(this);
        
        // Wave and spawn control variables
        this.wave = 1;
        this.activeEnemies = 0;
        this.spawnTimer = 0;
        this.aphidsThisWave = 0;
        this.aphidsSpawned = 0;

        // Initialize enemies
        this.aphidGroup = this.add.group({
            defaultKey: 'aphid',
            maxSize: 10,
            createCallback: (aphid) => {
                this.createAphid(aphid);
            }
        }); 
    }
    preload()
    {
        // The player sprite will follow the mouse cursor.
        // This removes the arrow from the cursor.
        this.sys.canvas.style.cursor = 'none';
    }
    create()
    {
        // Add boundaries to the world.
        this.physics.world.setBounds(0, 0, 800, 800);

        // Add background.
        this.add.image(400, 400, 'garden')
            .setDepth(0);

        // Add player sprite.
        this.player = this.add.sprite(400, 400, 'player')
            .setOrigin(0.5, 0.5)
            .setDepth(10);

        //Add sounds
        this.swingSound = this.sound.add('swing');

        const bgm = this.sound.add('bgm', { loop: true });
        bgm.play();

        // Add progress to boss tracker.
        this.add.text(400, 30, "Pests: " + this.pestsLeft)
             .setOrigin(0.5, 0.5)    
             .setFontFamily('game-font')
             .setFontSize(24)
             .setDepth(20);

        // Fades in to allow player to begin.
        this.cameras.main.fadeIn(500, 0, 0, 0);
        
    }

    update()
    {
        this.spawnTimer++;

        this.playerMove();
        this.initWaves();
       // this.spawnEnemies();
    }

    initPlayer()
    {
        // Moves mouse pointer to center screen.
        // Without this, the player doesn't visibly
        // spawn until the mouse is moved.
        this.input.activePointer.worldX = 400;
        this.input.activePointer.worldY = 400;
    }

    initWaves()
    {
        switch(this.wave)
        {
            case 1:
                this.aphidsThisWave = 20;
                break;
            default:
                break;
        }
    }

    playerMove()
    {
        // Moves player spade wherever the mouse moves.        
        this.player.x = this.input.activePointer.worldX;
        this.player.y = this.input.activePointer.worldY;
        
        // Allows clicking to change the animation.
        // Animation resets when not clicking.
        this.input.once('pointerdown', () => { 
            var timer = this.spawnTimer;
            this.player.play('Attacking', true);
            this.swingSound.play();
            this.player.stopAfterDelay(500);
            });
        this.input.on('pointerup', () => { 
            this.player.play('Resting', false)});
    }

    aphidMove(aphid)
    {
        // Gets random coordinates
        var x = this.randomCoordinate();
        var y = this.randomCoordinate();

        var rotateTo = new RotateTo(aphid);
        var moveTo = new MoveTo(aphid);

        rotateTo.rotateTowardsPosition(x, y, 0, 90);
        moveTo.setSpeed(50);
        moveTo.moveTo(x, y);        
    }

    createAphid(aphid)
    {
        var x = Phaser.Math.RND.between(0, 1) * 800;
        var y = this.randomCoordinate();

        aphid.x = x
            .y = y
            .setName('aphid' + this.aphidGroup.getLength())
            .setDepth(1)
            .setOrigin(0.5, 0.5)
            .setScale(0.75, 0.75);
        this.physics.add.existing(aphid);
        aphid.body.setCollideWorldBounds(true, 1, 1);
        this.aphidMove(aphid);
        //this.physics.add.collider(aphid, this.player)
    }

    spawnEnemies()
    {
        for(var i = this.aphidsSpawned; i <= this.aphidsThisWave; i++)
        {
            if(this.spawnTimer % 10 === 0)
            {
                //this.createAphid();
                this.aphidsSpawned++;
                this.activeEnemies++;
            }   
        }
    }

    randomCoordinate() // Sets X or Y coordinate for use in spawning and movement of enemies.
    {
        return Phaser.Math.RND.between(0, 800);
    }
}
//Plan is to remove groups and just spawn numbers based on waves
//This will allow each individual enemy to move about and not lock any out
//Enemy ideas:
    //snails who stop and hide in shell so often and become invulnerable but are otherwise harmless
    //wasps who sting
    //moles who throw dirt wads
    //slugs who leave damaging trails
    //boss 