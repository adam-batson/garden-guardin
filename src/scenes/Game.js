import Phaser, { Physics } from 'phaser';
import RotateTo from 'phaser3-rex-plugins/plugins/rotateto';

export default class Game extends Phaser.Scene
{
    init()
    {
        // Initializing...
        // Game control variables
        this.pestsLeft = 100;
        this.wave = 0;
        this.lives = 3;
    
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

        // Add boundaries to the world
        this.physics.world.setBounds(0, 0, 800, 800);

        // Add background
        this.background = this.add.image(400, 400, 'garden')
            .setDepth(0);       

        // Add sounds
        this.swingSound = this.sound.add('swing');
        this.hit = this.sound.add('hit-sound');
        this.enemyHurt = this.sound.add('enemy-hit');
        this.bossHurt = this.sound.add('boss-hit');
        this.buzz = this.sound.add('buzz');
        this.ouch = this.sound.add('ouch');

        this.bgm = this.sound.add('bgm', { loop: true });
        this.bossBgm = this.sound.add('boss-theme', { loop: true });
        this.bgm.play({
            volume: 0.85
        });

        // Fades in to allow player to begin
        this.cameras.main.fadeIn(500, 0, 0, 0);        

        // Init status text
        this.initStatus();
        
        // Init life pickup spawner
        this.lifeSpawnTimer();

        // Initial enemy spawn
        this.spawnTimer();

        // Animation handling
        this.moveTimer();        
    }

    update()
    {
        this.playerControl();
        this.waveSetup();
        this.updateStatus();
        this.checkWaves();

        this.lifeSpawnTimer();
    }

// Utility methods
    // Player init and control
    initPlayer()
    {
        this.player = this.add.sprite(400, 400, 'player')
            .setOrigin(0.5, 0.5)
            .setDepth(2);
        this.physics.add.existing(this.player)

        // Moves mouse pointer to center screen
        // Without this, the player doesn't visibly
        // spawn until the mouse is moved
        this.input.activePointer.worldX = 400;
        this.input.activePointer.worldY = 400;
    }

    playerControl()
    {
        // Moves player spade wherever the mouse moves      
        this.player.x = this.input.activePointer.worldX;
        this.player.y = this.input.activePointer.worldY;
        
        // Allows clicking to change the animation
        // Animation resets when not clicking
        this.input.on('pointerdown', () => { 
            this.playerAttack();
        });
        this.input.on('pointerup', () => { 
            this.player.play('Resting', false);
        });

        // Watch for player to touch life pickups
        this.checkLifePickup();
    }

    playerAttack()
    {
        this.player.play('Attacking', true);
        this.swingSound.play();
        this.checkKill();

    }

    // Wave setup and control
    checkWaves()
    {
        // Allows the wave to change.
        var x = this.pestsLeft;

        if(x <= 100 && x > 80)
        {
            this.wave = 1;
        }
        else if(x <= 80 && x > 60)
        {
            this.wave = 2;
        }
        else if(x <=60 && x > 40)
        {
            this.wave = 3;
        }
        else if(x <=40 && x > 20)
        {
            this.wave = 4;
        }
        else if(x >= 20)
        {
            this.wave = 5;
        }
        else if(x <= 0)
        {
        }
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

    setSpawnRates(aphidNum, waspNum, snailNum)
    {
        this.aphidsThisWave = aphidNum;
        this.waspsThisWave = waspNum;
        this.snailsThisWave = snailNum;
    }

    // Groups init and control
    initGroups()
    {
        this.initAphids();
        // this.initWasps();
        // this.initSnails();
    }

    // Life pickup spawning and control
    lifeSpawn()
    {
        var x = this.randomEdgeSpawnPoint() + 1;
        var y = this.randomEdgeSpawnPoint() + 1;

        this.lifeSprite = this.add.sprite(x, y, 'life')

        this.lifeSprite.setOrigin(0.5, 0.5)
            .setDepth(1);
        this.physics.add.existing(this.lifeSprite);
        this.lifeControl(this.lifeSprite);
    }

    checkLifePickup()
    {
        if(this.lives < 5)
        {
            this.physics.overlap(this.player, this.lifeSprite, () => {
                this.lives++;
                this.lifeSprite.destroy(true);
            })
        }
    }

    lifeControl(life)
    {
        var x = life.x + (100 * this.randomPosOrNeg());
        var y = life.y + (100 * this.randomPosOrNeg());

        this.tweens.add({
            targets: life,
            x: x,
            y: y,
            duration: 100,
            delay: Phaser.Math.RND.between(100, 500),
            ease: 'SineIn',
        });        

        if(life.x < 0 || life.y < 0 || life.x > 800 || life.y > 800)
        {
            life.destroy(true);
        }
    }

    // Aphids init and control
    initAphids()
    {
        // Initialize aphid group
        this.aphidGroup = this.add.group({
            defaultKey: 'aphid',
            maxSize: 10,
            createCallback: (aphid) => {
                this.aphidSetup(aphid);
                this.spriteControl(aphid);
                this.activeEnemies++;
                this.aphidsSpawned++;
            },
            removeCallback: () => {
                this.activeEnemies--;
                this.pestsLeft--;
            }
        });
    }

    aphidSetup(aphid)
    {
        aphid.x = this.randomEdgeSpawnPoint();
        aphid.y = this.randomBetweenXY(0, 800);

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
    }

    spriteControl(sprite)
    {
        // Gets random x & y to move to.
        do {
            var x = sprite.x + (100 * this.randomPosOrNeg());
        } while(x < 10 || x > 790);
        do {
            var y = sprite.y + (100 * this.randomPosOrNeg());
        } while(y < 10 || y > 790);

        var rotateTo = new RotateTo(sprite);
        rotateTo.rotateTowardsPosition(x, y, 0, 500);

        // Smoothly transitions to the new location.
        this.tweens.add({
            targets: sprite,
            x: x,
            y: y,
            duration: 300,
            delay: Phaser.Math.RND.between(100, 500),
            ease: 'SineIn',
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

    // Status text init and control
    initStatus()
    {
        // Add status text for waves and lives
        this.lifeText = this.add.text(275, 30, 'Lives: ' + this.lives)
        .setOrigin(0.5, 0.5)    
        .setFontFamily('game-font')
        .setFontSize(20)
        .setDepth(20);
        
        this.statusText = this.add.text(525, 30, 'Pests: ' + this.pestsLeft)
        .setOrigin(0.5, 0.5)    
        .setFontFamily('game-font')
        .setFontSize(20)
        .setDepth(20);
    }        

    updateStatus()
    {
        this.statusText.setText('Pests: ' + this.pestsLeft);
        this.lifeText.setText('Lives: ' + this.lives);
    }

    checkKill()
    {
        // When player overlaps an aphid...
        this.physics.overlap(this.player, this.aphidGroup, () => { 
            // Check each aphid in the group to see if it's the one overlaping the player...
            this.aphidGroup.children.each((child) => this.physics.overlap(this.player, child, () => {
                // If so, remove and destroy it.
                this.hitSounds();
                this.aphidGroup.remove(child, true, true)})
            )}
        );
    }

    hitSounds()
    {
        this.hit.play({
            volume: 0.7
        });
        this.enemyHurt.play({
            volume: 0.6,
            delay: 0.3
        });
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

    // Timers
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
            delay: 500,
            callback: () => {
                this.aphidGroup.children.each((child) => this.spriteControl(child), this);

            },
            loop: true
        });
    }

    lifeSpawnTimer()
    {
        // Generates an extra life after 10 to 30 seconds
        // To be used at the start of each wave
        this.time.addEvent({
            delay: 0,
            callback: () => {
                this.time.addEvent({
                    delay: this.randomBetweenXY(10000, 30000),
                    callback: () => {
                        this.lifeSpawn();
                    }
                })
            },
            loop: true
        });       
    }

    // Random number generators
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

    randomBetweenXY(x, y) // Sets X or Y coordinate for use in spawning and movement of enemies.
    {
        return Phaser.Math.RND.between(x, y);
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