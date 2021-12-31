import Phaser from 'phaser';
import RotateTo from 'phaser3-rex-plugins/plugins/rotateto';
import MoveTo from 'phaser3-rex-plugins/plugins/moveto';
import * as randoms from '../utils/randoms';
import FloatingNumbersPlugin from "../utils/floating-text/FloatingNumbersPlugin";

export default class Game extends Phaser.Scene
{
    init()
    {
        // Initializing...
        // Game control variables
        this.pestsLeft = 0;
        this.lives = 3;
        this.bossLife = 1;

        // Wave and spawn control variables
        this.activeEnemies = 0;
        this.aphidsSpawned = 0;
        this.bossSpawned = false;
        this.rocksTimerStarted = false;

        // Player and boss invulnerability window trackers
        this.playerWasHit = false;
        this.bossWasHit = false;
    }

    preload()
    {
        // The player sprite will follow the mouse cursor.
        // This removes the arrow from the cursor.
        this.sys.canvas.style.cursor = 'none';

        this.load.scenePlugin('floatingNumbersPlugin', FloatingNumbersPlugin, 'floatingNumbersPlugin', 'floatingNumbers');
    }

    create()
    {
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
        this.bossSwing = this.sound.add('boss-swing');
        this.buzz = this.sound.add('buzz');
        this.ouch = this.sound.add('ouch');
        this.getLife = this.sound.add('get-life');
        this.rocks = this.sound.add('rocks');
        this.win = this.sound.add('win');
        this.lose = this.sound.add('lose');

        this.bgm = this.sound.add('bgm', { loop: true });
        this.bossBgm = this.sound.add('boss-theme', { loop: true });

        this.bgm.play( { volume: 0.75 } );
        
        // Initiate game objects
        this.groupsInit();
        this.playerInit();
        this.statusInit();
        this.bossInit();

        // Fades in to allow player to begin
        this.cameras.main.fadeIn(500, 0, 0, 0);        

        // Start life gain timer
        this.lifeGainTimer();

        // Start enemy spawn timer
        this.spawnTimers();

        // Start enemy move timer
        this.moveTimers();      
        this.playerControl();
    }

    update()
    {
        this.playerControl();
        this.updateStatus();
    }

    //########################################################
    //#------------------------------------------------------#
    //#------------------------------------------------------#
    //#----------------- Utility methods  -------------------#
    //#------------------------------------------------------#
    //#------------------------------------------------------#
    //########################################################
    
    // Player init and control
    playerInit()
    {
        this.player = this.add.sprite(400, 400, 'player')
            .setOrigin(0.5, 0.5)
            .setDepth(3);
        this.physics.add.existing(this.player);
        this.player.body.setSize(52, 128, true);

        // Moves mouse pointer to center screen
        // Without this, the player doesn't visibly
        // spawn until the mouse is moved
        this.input.activePointer.worldX = 400;
        this.input.activePointer.worldY = 400;

        // Allows clicking to change the animation
        // Animation resets when not clicking
        this.input.on('pointerdown', () => { 
            this.playerAttack();
        });
        this.input.on('pointerup', () => { 
            this.player.play('Resting', false);
        });
    }

    playerControl()
    {
        // Moves player spade wherever the mouse moves      
        this.player.x = this.input.activePointer.worldX;
        this.player.y = this.input.activePointer.worldY;
    }

    playerAttack()
    {
        this.player.play('Spade-down', true);
        this.swingSound.play();
        this.checkKill();
    }

    // Groups init and control
    groupsInit()
    {
        this.aphidsInit();
        this.waspsInit();
        this.rocksInit();
    }
   
    // Rocks init and control
    rocksInit()
    {
        // Initialize rocks group
        this.rockGroup = this.add.group({
            defaultKey: 'rock',
            maxSize: 6,
            createCallback: (rock) => {
                this.rocksSetup(rock);
                this.rocksControl(rock);
            }
        });
    }

    rocksSetup(rock)
    {
        // Create individual rocks at boss position
        rock.x = this.bossGroup.getFirst().x;
        rock.y = this.bossGroup.getFirst().y;
        
        rock.setName('rock' + this.rockGroup.getLength())
            .setDepth(2)
            .setOrigin(0.5, 0.5)
            .setScale(1.5, 1.5)
            .play({
                key: 'Rolling',
                repeat: -1,
                ignoreIfPlaying: false
            });
        this.physics.add.existing(rock);
        rock.body.setCircle(12, 4, 4);
        rock.body.setCollideWorldBounds(false, 0, 0);
    }

    rocksControl(rock)
    {
        var x = randoms.randomBetweenXY(0, 800);
        var y = randoms.randomBetweenXY(0, 800);

        this.physics.moveTo(rock, x, y, 150);

        this.physics.overlap(rock, this.player, () => {
            rock.destroy();
            this.time.delayedCall(500, () => { this.playerHit() });
        });
        if(rock.x <= 0 || rock.x >= 800 || rock.y <= 0 || rock.y >= 800)
        {
            rock.destroy();
        }
    }

    // Aphids init and control
    aphidsInit()
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
            }
        });
    }

    aphidSetup(aphid)
    {
        // Create individual aphids on the left or right side at random Y coordinate
        aphid.x = randoms.randomEdgeSpawnPoint();
        aphid.y = randoms.randomBetweenXY(0, 800);

        aphid.setName('aphid' + this.aphidGroup.getLength())
            .setDepth(1)
            .setOrigin(0.5, 0.5)
            .setScale(0.4, 0.4)
            .play({
                key: 'Walking',
                repeat: -1,
                ignoreIfPlaying: true
            });
        this.physics.add.existing(aphid);
        aphid.body.setCircle(28, 0, 0);
        aphid.body.setCollideWorldBounds(true, 1, 1);
    }

    aphidControl(aphid)
    {
        // Gets random x & y to move to.
        do {
            var x = aphid.x + (randoms.randomBetweenXY(50, 100) * randoms.randomPosOrNeg());
        } while(x < 10 || x > 790);
        do {
            var y = aphid.y + (randoms.randomBetweenXY(50, 100) * randoms.randomPosOrNeg());
        } while(y < 10 || y > 790);

        // Change aphid facing
        var rotateTo = new RotateTo(aphid);
        rotateTo.rotateTowardsPosition(x, y, 0, 1000);

        // Smoothly transitions to the new location.
        this.tweens.add({
            targets: aphid,
            x: x,
            y: y,
            duration: 250,
            delay: 250,
            ease: 'SineIn',
        });
    }

    waspsInit()
    {
        // Initialize wasp group
        this.waspGroup = this.add.group({
            defaultKey: 'wasp',
            maxSize: 5,
            createCallback: (wasp) => {
                this.waspSetup(wasp);
                this.waspControl(wasp);
                this.activeEnemies++;
            },
            removeCallback: () => {
                this.activeEnemies--;
                this.pestsLeft--;
            }
        });
    }

    waspSetup(wasp)
    {
        // Create individual wasps on the left or right side at random Y coordinate
        wasp.x = randoms.randomEdgeSpawnPoint();
        wasp.y = randoms.randomBetweenXY(0, 800);

        wasp.setName('wasp' + this.waspGroup.getLength())
            .setDepth(1)
            .setOrigin(0.5, 0.5)
            .setScale(0.9, 0.9)
            .play({
                key: 'Flying',
                repeat: -1,
                ignoreIfPlaying: true
            });
        this.physics.add.existing(wasp);
        wasp.body.setSize(56, 56, true);
        wasp.body.setCollideWorldBounds(true, 1, 1);
    }

    waspControl(wasp)
    {
        // Gets random x & y to move to.
        do {
            var x = wasp.x + (randoms.randomBetweenXY(75, 150) * randoms.randomPosOrNeg());
        } while(x < 32 || x > 768);
        do {
            var y = wasp.y + (randoms.randomBetweenXY(75, 150) * randoms.randomPosOrNeg());
        } while(y < 32 || y > 768);

        // Smoothly transitions to the new location.
        this.tweens.add({
            targets: wasp,
            x: x,
            y: y,
            duration: 400,
            delay: Phaser.Math.RND.between(100, 300),
            ease: 'Bounce.easeInOut',
        });

        // Check if wasp can hit player
        this.physics.overlap(wasp, this.player, () => {
            this.buzz.play( { volume: 2.5 } );
            wasp.play({
                key: 'Sting',
                delay: 500,
                repeat: 5,
                repeatDelay: 50,
                ignoreIfPlaying: true
            });
            wasp.play({
                key: 'Flying',
                delay: 750,
                repeat: -1,
                ignoreIfPlaying: true
            });
                // Verifies player hasn't moved away from wasp and isn't invulerable
                var diffX = wasp.x - this.player.x;
                var diffY = wasp.y - this.player.y;
                if((Math.abs(diffX) <= 150 || Math.abs(diffY) <= 150) && this.playerWasHit === false)
                {
                    this.physics.overlap(wasp, this.player, () => { this.playerHit() });
                }
        });
    }

    bossInit()
    {
        // Create the boss
        this.bossGroup = this.add.group({
            defaultKey: 'boss',
            maxSize: 1,
            createCallback: (boss) => {
                this.bossSetup(boss);
                this.bossControl(boss);
                this.activeEnemies++;
            }
        });
    }

    bossSetup(boss)
    {
        // Sets up the boss
        boss.x = 400;
        boss.y = 400;

        boss.setName('boss')
            .setDepth(1)
            .setOrigin(0.5, 0.5)
            .play({
                key: 'Moving',
                repeat: -1,
                ignoreIfPlaying: true
            });      
        this.physics.add.existing(boss);
        boss.body.setCircle(120, 10, -5);
        boss.body.setCollideWorldBounds(true, 1, 1);
    }

    bossControl(boss)
    {
        // Gets random x & y to move to.
        do {
            var x = boss.x + (randoms.randomBetweenXY(100, 250) * randoms.randomPosOrNeg());
        } while(x < 128 || x > 672);
        do {
            var y = boss.y + (randoms.randomBetweenXY(100, 250) * randoms.randomPosOrNeg());
        } while(y < 128 || y > 672);

        // Smoothly transitions to the new location.
        this.tweens.add({
            targets: boss,
            x: x,
            y: y,
            duration: 500,
            delay: randoms.randomBetweenXY(100, 200),
            ease: 'Power1',
        });

        // Check if boss can hit player
        this.physics.overlap(boss, this.player, () => {
            boss.play({
                key: 'Attack',
                delay: 500,
                repeat: 5,
                repeatDelay: 50,
                ignoreIfPlaying: true
            });
            boss.play({
                key: 'Moving',
                delay: 500,
                repeat: -1,
                ignoreIfPlaying: true
            });
        });
            this.bossSwing.play( { volume: 0.8 } );
            this.time.delayedCall(500, this.playerHit());
    }

    spawnEnemies()
    {
        if(this.pestsLeft > 0 && this.activeEnemies < 20)
        {                  
            // if(!this.aphidGroup.isFull())
            // {
            //         this.time.addEvent({
            //             delay: 1000,
            //             callback: () => {
            //                 this.aphidGroup.create();
            //             }
            //         });
            // }
                
            if(/*this.aphidsSpawned >= 20 &&*/ !this.waspGroup.isFull())
            {
                this.time.addEvent({
                    delay: 3000,
                    callback: () => {
                        this.waspGroup.create();
                    }
                });
            }
        }
        else if(this.pestsLeft === 0 && this.bossSpawned === false)
        {
            this.bossSpawned = true;

            this.time.addEvent({
                delay: 5000,
                callback: () => {
                    this.bossGroup.create();
                    this.bgm.stop();
                    this.bossBgm.play( { volume: 0.75 } );
                }
            });
            if(!this.rocksTimerStarted)
            {
                this.rocksTimerStarted = true;
                this.rocksTimer();
            }
        }
    }

    rocksAttack()
    {
        for(var i = 0; i < 6; i++)
        {
            this.rocks.play();
            this.rockGroup.create();
        }
    }

    // Status text init and control
    statusInit()
    {
        // Add status text for pests and lives
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
        // Update status text for pests and lives
        this.statusText.setText('Pests: ' + this.pestsLeft);
        this.lifeText.setText('Lives: ' + this.lives);
    }

    checkKill()
    {
        // When player overlaps an enemy, check each enemy in the group
        // to see if it's the one overlapping the player. If so,
        // remove and destroy it.

        // Aphids
        this.physics.overlap(this.player, this.aphidGroup, () => {
            this.aphidGroup.children.each((child) => { 
                this.physics.overlap(this.player, child, () => {
                    this.hitSoundsEnemy();
                    child.destroy();
                });
            });
        });
        
        // Wasps
        this.physics.overlap(this.player, this.waspGroup, () => { 
            this.waspGroup.children.each((child) => { 
                this.physics.overlap(this.player, child, () => {
                    this.hitSoundsEnemy();
                    child.destroy();
                });
            });
        });

        // Rocks
        this.physics.overlap(this.player, this.rockGroup, () => {
            this.rockGroup.children.each((child) => {
                this.physics.overlap(this.player, child, () => {
                    child.destroy();
                    this.time.delayedCall(500, () => { this.playerHit() });
                });
            });
        });

        // Boss
        this.physics.overlap(this.player, this.bossGroup, () => {
            this.bossGroup.children.each((child) => {
                this.physics.overlap(this.player, child, () => {
                    child.destroy();
                    this.time.delayedCall(500, () => { this.bossHit(child) });
                });
            });
        });
    }

    playerHit()
    {
        // If player is not flagged as just being hit, sound plays and damage is dealth. Then flashes and becomes invulnerable for 1.5 seconds
        // Flag is enabled after the hit and disabled after 1.5 seconds
        if(this.playerWasHit === false)
        {
            this.ouch.play( { volume: 0.6 } );
            this.lives--;

            this.playerWasHit = true;
            this.player.setTint(0x990000);
            this.time.delayedCall(250, () => { this.player.setAlpha(0.5) });
            this.time.delayedCall(500, () => { this.player.setAlpha(1) });
            this.time.delayedCall(750, () => { this.player.setAlpha(0.5) });
            this.time.delayedCall(1000, () => { this.player.setAlpha(1) });
            this.time.delayedCall(1250, () => { this.player.setAlpha(0.5) });
            this.time.delayedCall(1500, () => {
                this.player.setAlpha(1);
                this.player.clearTint();
                this.playerWasHit = false;
            });

            // Checks for player death and triggers game over sequence.
            if(this.lives === 0)
            {
                this.sound.stopAll();

                this.lose.play();
                this.time.delayedCall(1000, () => { this.player.destroy() });

                // Fades out to transition to win screen.
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('lose');
                });
            }
        }
    }

    bossHit(boss)
    {
        // If boss is flagged as just being hit, flashes and becomes invulnerable for 2 seconds
        if(this.bossWasHit === false)
        {
            this.hitSoundsBoss();
            this.bossLife--;

            this.bossWasHit = true;
            boss.setTint(0x990000);

            // Flash animation
            this.time.delayedCall(200, () => { boss.setAlpha(0.5) });
            this.time.delayedCall(400, () => { boss.setAlpha(1) });
            this.time.delayedCall(600, () => { boss.setAlpha(0.5) });
            this.time.delayedCall(800, () => { boss.setAlpha(1) });
            this.time.delayedCall(1000, () => { boss.setAlpha(0.5) });
            this.time.delayedCall(1200, () => { boss.setAlpha(1) });
            this.time.delayedCall(1400, () => { boss.setAlpha(0.5) });
            this.time.delayedCall(1600, () => { boss.setAlpha(1) });
            this.time.delayedCall(1800, () => { boss.setAlpha(0.5) });
            this.time.delayedCall(2000, () => {
                boss.setAlpha(1);
                boss.clearTint();
                this.bossWasHit = false;
            });
            
            // Checks for boss death and triggers win sequence.
            if(this.bossLife === 0)
            {
                this.sound.stopAll();

                this.win.play();
                this.bossGroup.children.each((child) => { 
                    child.stop();
                    this.time.delayedCall(1000, () => {
                        child.destroy(true);
                        this.bossSpawned = false;
                    });
                });
                

                // Fades out to transition to win screen.
                this.cameras.main.fadeOut(1000, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    this.scene.start('win');
                });
            }
        }
    }

    hitSoundsEnemy()
    {
        this.hit.play({
            volume: 0.6
        });
        this.enemyHurt.play({
            volume: 0.45,
            delay: 0.3
        });
    }

    hitSoundsBoss()
    {
        this.hit.play({
            volume: 0.6
        });
        this.bossHurt.play({
            volume: 0.45,
            delay: 0.3
        });
    }

    // Timers
    // Allows repeating events such as spawns and movement changes.

    spawnTimers()
    {
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                this.spawnEnemies();
            },
            loop: true
        });
    }

    moveTimers()
    {
        if(this.aphidGroup)
        {
            this.time.addEvent({
                delay: 500,
                callback: () => {
                    this.aphidGroup.children.each((child) => { this.aphidControl(child) }, this);
                },
                loop: true
            });
        }

        if(this.waspGroup)
        {
            this.time.addEvent({
                delay: 750,
                callback: () => {
                    this.waspGroup.children.each((child) => { this.waspControl(child) }, this);
                },
                loop: true
            });
        }

        if(this.bossGroup && !this.bossSpawned)
        {
            this.time.addEvent({
                delay: 5000,
                callback: () => {
                    if(this.bossGroup.isFull())
                    {
                        this.bossSpawned = true;
                        var boss = this.bossGroup.getFirstAlive();
                        this.time.addEvent({
                            delay: 1000,
                            callback: () => {
                                this.bossControl(boss);
                            },
                            loop: true
                        });
                    }
                },
                loop: true
            });            
        }        
    }

    rocksTimer()
    {
        if(this.bossSpawned === true)
        {
            this.time.addEvent({
                delay: randoms.randomBetweenXY(10000, 15000),
                callback: () => {
                    this.rocksAttack();
                },
                loop: true
            })
        }
    }

    lifeGainTimer()
    {
        // Generates an extra life every minute
        this.time.addEvent({
            delay: 60000,
            callback: () => {
                this.getLife.play( { volume: 0.7 } );
                if(this.lives < 5)
                {
                    this.lifeGainText();
                    this.lives++;            
                }
            },
            repeat: true,
            repeatCount: 5
        });       
    }

    lifeGainText()
    {
        this.floatingNumbers.createFloatingText({
            textOptions: {
                fontFamily: 'game-font',
                fontSize: 28,
                color: "#ffffff",
                strokeThickness: 2,
                fontWeight: "normal",
                stroke: "#000000",
            },
            text: "+1 Life",
            align: "top-center",
            parentObject: this.player,
            animation: "up",
            animationEase: "Linear"
        });
    }
}

