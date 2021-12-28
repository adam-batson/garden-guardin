import Phaser from 'phaser';
import RotateTo from 'phaser3-rex-plugins/plugins/rotateto';
import MoveTo from 'phaser3-rex-plugins/plugins/moveto';

export default class Game extends Phaser.Scene
{
    init()
    {
        this.pestsLeft = 100;
        this.lives = 3;
        this.initPlayer();
        
        // Wave and spawn control variables
        this.wave = 1;
        this.activeEnemies = 0;
        this.aphidsThisWave = 0;
        this.aphidsSpawned = 0;

        // Initialize enemies
        this.aphidGroup = this.add.group({
            defaultKey: 'aphid',
            maxSize: 10,
            createCallback: (aphid) => {
                this.createAphid(aphid);
                this.aphidMove(aphid);
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

        // Add player sprite and physics.
        this.player = this.add.sprite(400, 400, 'player')
            .setOrigin(0.5, 0.5)
            .setDepth(10);
        this.physics.add.existing(this.player);
        
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

        // Initial enemy spawn.
        //this.spawnEnemies();
        this.spawnTimer();

        // Animation handling
        this.moveTimer();
        this.aphidGroup.playAnimation({
            key: 'Walking',
            repeat: -1})

        // Sprite test
        // var sp = this.add.sprite(400, 400, 'aphid').play({
        //     key: 'Walking', 
        //     repeat: -1,
        //     ignoreIfPlaying: true})
        //     .setScale(2, 2)
    }

    update()
    {
        this.playerMove();
        this.initWaves();
    }

    spawnTimer()
    {
        // Allows repeating events such as spawns and movement changes.
        var timer = this.time.addEvent({
            delay: 2500,
            callback: () => {
                this.spawnEnemies();
            },
            loop: true
        });
    }

    moveTimer()
    {
        var timer = this.time.addEvent({
            delay: 5000,
            callback: () => {
                this.aphidGroup.children.each((child) => this.aphidMove(child), this);
            },
            loop: true
        });
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
            this.player.play('Attacking', true);
            this.swingSound.play();
            });
        this.input.on('pointerup', () => { 
            this.player.play('Resting', false)});
    }

    aphidMove(aphid)
    {
        // Gets random coordinates
        do {
            var x = aphid.x + (100 * this.randomPosOrNeg());
        } while(x < 0 || x > 800);
        do {
            var y = aphid.y + (10 * this.randomPosOrNeg());
        } while(y < 0 || y > 800);
        console.log(aphid.x + ', ' + aphid.y)

        console.log(x + ', ' + y)
        this.tweens.add({
            targets: aphid,
            x: x,
            y: y,
            duration: 1000,
            delay: Phaser.Math.RND.between(100, 500),
            ease: 'SineOut',
        });
        
        var rotateTo = new RotateTo(aphid);

        rotateTo.rotateTowardsPosition(x, y, 0, 500)
        // moveTo.moveToward(angle, distance * 2)
        //     .setSpeed(90);

    }

    createAphid(aphid)
    {
        aphid.x = Phaser.Math.RND.between(0, 1) * 800;
        aphid.y = this.randomCoordinate();

        aphid.setName('aphid' + this.aphidGroup.getLength())
            .setDepth(1)
            .setOrigin(0.5, 0.5)
            .setScale(0.6, 0.6)
            .play({
                key: 'Walking',
                repeat: -1,
                ignoreIfPlaying: true
            });
        this.physics.add.existing(aphid);
        aphid.body.setCollideWorldBounds(true, 1, 1);
        this.physics.add.collider(aphid, this.player);
    }

    spawnEnemies()
    {
        if(this.aphidsSpawned < this.aphidsThisWave)
        {
            this.aphidGroup.create();
            this.aphidsSpawned++;
            this.activeEnemies++; 
        }
    }

    randomPosOrNeg()
    {
        return Phaser.Math.RND.between(-1, 1);
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