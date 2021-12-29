import Phaser from 'phaser';
import RotateTo from 'phaser3-rex-plugins/plugins/rotateto';

export default class Game extends Phaser.Scene
{
    init()
    {
        // Initializing...
        // Game control variables
        this.pestsLeft = 100;
        this.wave = 1;

        this.lastWave = 1;

        // Wave and spawn control variables
        this.activeEnemies = 0;
        this.aphidsSpawned = 0;
        this.waspsSpawned = 0;
        this.snailsSpawned = 0;   
    }

    preload()
    {
        // The player sprite will follow the mouse cursor.
        // This removes the arrow from the cursor.
        this.sys.canvas.style.cursor = 'none';
    }

    create()
    { 
        this.waveSetup();
        this.initGroups();
        this.initPlayer();

        // Add boundaries to the world.
        this.physics.world.setBounds(0, 0, 800, 800);

        // Add background.
        this.add.image(400, 400, 'garden')
            .setDepth(0);       
        
        //Add sounds
        this.swingSound = this.sound.add('swing');

        const bgm = this.sound.add('bgm', { loop: true });
        const boss = this.sound.add('boss-theme', { loop: true });
        bgm.play();

        // Fades in to allow player to begin.
        this.cameras.main.fadeIn(500, 0, 0, 0);        

         // Add progress to boss tracker.
         this.statusText = this.add.text(400, 30, "Pests: " + this.pestsLeft)
            .setOrigin(0.5, 0.5)    
            .setFontFamily('game-font')
            .setFontSize(24)
            .setDepth(20);

        // Initial enemy spawn.
        this.spawnTimer();

        // Animation handling
        this.moveTimer();        
    }

    update()
    {
        this.playerMove();
        this.waveSetup();
        this.updateStatus();
        this.checkWaves();
        this.updateLives();
        this.checkKill();
        console.log('Aphids in group: ' + this.aphidGroup.getTotalUsed())
    }

// Utility methods
    initPlayer()
    {
        // Player starts with 3 lives.
        this.lives.createMultiple(3);

        this.player = this.add.sprite(400, 400, 'player')
            .setOrigin(0.5, 0.5)
            .setDepth(2);
        this.physics.add.existing(this.player);
        this.physics.add.overlap(this.player, this.aphidGroup);

        // Moves mouse pointer to center screen.
        // Without this, the player doesn't visibly
        // spawn until the mouse is moved.
        this.input.activePointer.worldX = 400;
        this.input.activePointer.worldY = 400;
    }

    initGroups()
    {
        this.initLives();
        this.initAphids();
        // this.initWasps();
        // this.initSnails();
    }

    initLives()
    {
        // Initialize lives group
        this.lives = this.add.group({
            defaultKey: 'glove',
            maxSize: 5,
            createCallback: (life) => {
                life.setName('life' + this.lives.getLength())
                    .setOrigin(0.5, 0.5)
                    .setDepth(1)
            },
            removeCallback: {

            }
        });
    }

    initAphids()
    {
        // Initialize aphid group
        this.aphidGroup = this.add.group({
            defaultKey: 'aphid',
            maxSize: 10,
            createCallback: (aphid) => {
                this.aphidSetup(aphid);
                this.aphidControl(aphid);
                this.activeEnemies++;
                this.aphidsSpawned++;
            },
            removeCallback: () => {
                this.activeEnemies--;
                this.pestsLeft--;
                console.log('Active: ' + this.activeEnemies)
            }
        });
    }

    initWasps()
    {
        // // Initialize wasp group
        // this.waspGroup = this.add.group({
        //     defaultKey: 'wasp',
        //     maxSize: 10,
        //     createCallback: (wasp) => {
        //         this.initWasp(wasp);
        //         this.waspMove(wasp);
        //         this.activeEnemies++;
        //         this.waspsSpawned++;
        //     },
        //     removeCallback: (wasp) => {
        //         this.activeEnemies--;
        //         this.pestsLeft--;
        //     }
        // });
    }

    initSnails()
    {
        // Initialize snail group
        // this.snailGroup = this.add.group({
        //     defaultKey: 'snail',
        //     maxSize: 10,
        //     createCallback: (snail) => {
        //         this.initSnail(snail);
        //         this.snailMove(snail);
        //         this.activeEnemies++;
        //         this.snailsSpawned++;
        //     },
        //     removeCallback: (snail) => {
        //         this.activeEnemies--;
        //         this.pestsLeft--;
        //     }
        // });
    }

    updateStatus()
    {
        this.statusText.setText('Pests: ' + this.pestsLeft);
    }

    setSpawnRates(aphidNum, waspNum, snailNum)
    {
        this.aphidsThisWave = aphidNum;
        this.waspsThisWave = waspNum;
        this.snailsThisWave = snailNum;
    }

    waveSetup()
    {
        switch(this.wave)
        {
            case 1:
                this.setSpawnRates(20, 0, 0);
                break;
            case 2:
                this.setSpawnRates(15, 5, 0);
                break;
            case 3:
                this.setSpawnRates(10, 10, 0);
                break;
            case 4:
                this.setSpawnRates(5, 10, 5);
                break;
            case 5:
                this.setSpawnRates(0, 10, 10);
                break;
            default:
                this.setSpawnRates(0, 0, 0);
                break;
        }
    }

    aphidSetup(aphid)
    {
        aphid.x = this.randomEdgeSpawnPoint();
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

    updateLives()
    {
        Phaser.Actions.GridAlign(this.lives.getChildren(), {
            width: 5,
            height: 1,
            cellHeight: 64,
            cellWidth: 64,
            x: 455,
            y: 40
        });
    }

    updateWaves(x)
    {
        this.wave = x;
        this.lastWave = this.wave - 1;
    }

    checkWaves()
    {
        // Allows the wave to change.
        var x = this.pestsLeft;

        switch(x)
        {
            case x >= 100 && x <= 80:
                this.updateWaves(1);
                break;
            case x >= 80 && x <= 60:
                this.updateWaves(2);
                break;
            case x >= 60 && x <= 40:
                this.updateWaves(3);
                break;
            case x >= 40 && x <= 20:
                this.updateWaves(4);
                break;
            case x >= 0 && x <= 20:
                this.updateWaves(5);
                break;
            default:
                break;
        }
    }

    extraLife()
    {
        var x = this.randomEdgeSpawnPoint();
        var y = this.randomEdgeSpawnPoint();

        if(this.wave !== this.lastWave)
        {
            this.lives.create({
            createCallback: (life) => {
                life.setName('life' + this.lives.getLength())
                    .setOrigin(0.5, 0.5)
                    .setDepth(1);
                this.lifeMove(life);
                }
            });
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

    lifeMove(life)
    {
        var x = life.x + (100 * this.randomPosOrNeg());
        var y = life.y + (100 * this.randomPosOrNeg());

        this.tweens.add({
            targets: life,
            x: x,
            y: y,
            duration: 600,
            delay: Phaser.Math.RND.between(100, 500),
            ease: 'SineIn',
        });
        
        this.physics.add.overlap(life, this.player, (life) => { 
            collectLife();
            life.destroy();
            return;
        });

        if(life.x <= 0 || life.y <= 0)
        {
            life.destroy();
            return;
        }
    }

    aphidControl(aphid)
    {
        // Gets random x & y to move to.
        do {
            var x = aphid.x + (100 * this.randomPosOrNeg());
        } while(x < 10 || x > 790);
        do {
            var y = aphid.y + (100 * this.randomPosOrNeg());
        } while(y < 10 || y > 790);

        var rotateTo = new RotateTo(aphid);
        rotateTo.rotateTowardsPosition(x, y, 0, 500);

        // Smoothly transitions to the new location.
        this.tweens.add({
            targets: aphid,
            x: x,
            y: y,
            duration: 600,
            delay: Phaser.Math.RND.between(100, 500),
            ease: 'SineIn',
        });
    }

    collectLife()
    {

    }

    checkKill()
    {

        this.aphidGroup.children.each((aphid) => {
            this.physics.add.overlap(aphid, this.player, (aphid) => { 
                this.aphidGroup.remove(aphid, true, true);
            }); 
        })
    }

    spawnEnemies()
    {
        if(this.activeEnemies < 20)
        {
            if(this.aphidGroup.getTotalUsed() < this.aphidsThisWave)
            {
                this.aphidGroup.create();
            }
        } 
    }

    spawnTimer()
    {
        // Allows repeating events such as spawns and movement changes.
        var timer = this.time.addEvent({
            delay: 2000,
            callback: () => {
                this.spawnEnemies();
            },
            loop: true
        });
    }

    moveTimer()
    {
        var timer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.aphidGroup.children.each((child) => this.aphidControl(child), this);

            },
            loop: true
        });
    }

    randomPosOrNeg() // Returns -1 or 1
    {
        do {
            var coord = Phaser.Math.RND.between(-1, 1);
        } while (coord === 0);

        return coord;
    }

    randomEdgeSpawnPoint()
    {
        return Phaser.Math.RND.between(0, 1) * 800;
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