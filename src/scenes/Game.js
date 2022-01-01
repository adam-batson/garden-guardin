import Phaser from 'phaser';
import * as randoms from '../utils/randoms';
import FloatingNumbersPlugin from "../utils/floating-text/FloatingNumbersPlugin";

export default class Game extends Phaser.Scene
{
    init()
    {
        // Initializing...
        // Game control variables
        this.pestsLeft = 100;
        this.lives = 5;
        this.bossLife = 10;

        // Wave and spawn control variables
        this.activeEnemies = 0;
        this.bossSpawned = false;
        this.boss;

        // Player and boss invulnerability window trackers
        this.playerWasHit = false;
        this.bossWasHit = false;

        // Flash to remove overspawn
        this.flash = this.cameras.add();
        this.flashed = false;
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

        // Fades in to allow player to begin
        this.cameras.main.fadeIn(500, 0, 0, 0);        

        // Start life gain timer
        this.lifeGainTimer();

        // Start enemy spawn timer
        this.spawnTimers();

        // Start enemy move timer
        // this.checkPlayerHitTimer();
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
            this.player.play('Spade-down', true);
            this.swingSound.play();
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

    // Groups init and control
    groupsInit()
    {
        this.aphidsInit();
        this.waspsInit();
        this.rocksInit();
        this.bossInit();
    }
   
    // Rocks init and control
    rocksInit()
    {
        // Initialize rocks group
        this.rocksGroup = this.add.group({
            defaultKey: 'rock',
            maxSize: 6,
            createCallback: (rock) => {
                rock.x = this.boss.x;
                rock.y = this.boss.y;
                
                rock.setName('rock' + this.rocksGroup.getLength())
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
                this.rocksControl(rock);
                this.physics.add.collider(rock, this.player, () => {
                    rock.body.destroy();
                    rock.destroy();
                    this.playerHit();
                });
            }
        });
    }

    rocksControl(rock)
    {
        var x = randoms.randomBetweenXY(0, 800);
        var y = randoms.randomBetweenXY(0, 800);

        this.physics.moveTo(rock, x, y, 500);
    }

    // Aphids init and control
    aphidsInit()
    {
        // Initialize aphid group
        this.aphidGroup = this.add.group({
            defaultKey: 'aphid',
            maxSize: 10,
            createCallback: (aphid) => {
                this.activeEnemies++;

                // Aphid setup
                aphid.x = randoms.randomEdgeSpawnPoint();
                aphid.y = randoms.randomBetweenXY(0, 800);
        
                aphid.setName('aphid' + this.aphidGroup.getLength())
                    .setDepth(1)
                    .setOrigin(0.5, 0.5)
                    .setScale(0.4, 0.4)
                    .play({
                        key: 'Walking',
                        repeat: -1,
                        ignoreIfPlaying: false
                    });

                // Starts movement
                if(aphid){
                this.time.addEvent({
                    delay: 500,
                    callback: () => {
                        this.aphidControl(aphid);
                    },
                    loop: true
                });}
                
                // Physics
                this.physics.add.existing(aphid);
                aphid.body.setCircle(28, 0, 0);
                aphid.body.setCollideWorldBounds(true, 1, 1);
                
                this.deathHandler(enemy);
            },
            removeCallback: (aphid) => {
                if(!this.aphidGroup.contains(aphid))
                {
                    this.activeEnemies--;
                    this.pestsLeft--;
                }
            }
        });
    }

    aphidControl(aphid)
    {
        // Gets random x & y to move to.
        var x = aphid.x + (randoms.randomBetweenXY(50, 75) * randoms.randomPosOrNeg());
        var y = aphid.y + (randoms.randomBetweenXY(50, 75) * randoms.randomPosOrNeg());

        // Smoothly transitions to the new location.
        this.tweens.add({
            targets: aphid,
            x: x,
            y: y,
            duration: 600,
            ease: 'Power1',
        });

    }

    waspsInit()
    {
        // Initialize wasp group
        this.waspGroup = this.add.group({
            defaultKey: 'wasp',
            maxSize: 5,
            createCallback: (wasp) => {
                this.activeEnemies++;

                // Wasp setup
                wasp.x = randoms.randomEdgeSpawnPoint();
                wasp.y = randoms.randomBetweenXY(0, 800);
        
                wasp.setName('wasp' + this.waspGroup.getLength())
                    .setDepth(1)
                    .setOrigin(0.5, 0.5)
                    .play({
                        key: 'Flying',
                        repeat: -1,
                        ignoreIfPlaying: false
                    });

                // Physics
                this.physics.add.existing(wasp);
                wasp.body.setCircle(32, 0, 0);
                wasp.body.setCollideWorldBounds(true, 1, 1);
                this.physics.add.overlap(wasp, this.player, () => {
                    var xWhenOverlap = wasp.x;
                    var yWhenOverlap = wasp.y;
                    
                    // Gives player half a second to avoid damage, or else wasps are too deadly
                    this.time.delayedCall(500, () => {
                        // If distance from player to wasp is under 100 px, the player gets hit
                        var diffX = Math.abs(xWhenOverlap - this.player.x);
                        var diffY = Math.abs(yWhenOverlap - this.player.y);
                        if(diffX <= 100 && diffY <= 100 && this.playerWasHit === false)
                        {
                            if(this.waspGroup.contains(wasp))
                            {
                                this.buzz.play( { volume: 2.25 } );
                                wasp.play({
                                    key: 'Stinging',
                                    repeat: 4,
                                    ignoreIfPlaying: false
                                });
                                wasp.once('animationcomplete', () => {
                                    wasp.play({
                                        key: 'Flying',
                                        repeat: -1,
                                        ignoreIfPlaying: true
                                    });
                                });
                                this.playerHit();
                            }
                        }
                    });

                    this.deathHandler(wasp);
                });

                // Starts movement
                this.time.addEvent({
                    delay: 750,
                    callback: () => {
                        this.waspControl(wasp);
                    },
                    loop: true
                });
            },
            removeCallback: (wasp) => {
                if(!this.waspGroup.contains(wasp))
                {
                    this.activeEnemies--;
                    this.pestsLeft--;
                }
            }
        });
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
            duration: 800,
            ease: 'Circ.easeOut',
        });
    }

    bossInit()
    {
        // Create the boss
        this.bossGroup = this.add.group({
            defaultKey: 'boss',
            maxSize: 1,
            createCallback: (boss) => {
                
                boss.x = 400;
                boss.y = 400;
        
                boss.setName('boss')
                    .setDepth(1)
                    .setOrigin(0.5, 0.5)
                    .play({
                        key: 'Moving',
                        repeat: -1,
                        ignoreIfPlaying: false
                    }); 
                
                // Control variables
                this.boss = boss;
                this.bossSpawned = true;

                // Physics
                this.physics.add.existing(boss);
                boss.body.setCircle(115, 10, -5);
                boss.body.setCollideWorldBounds(true, 1, 1);
                this.physics.add.overlap(boss, this.player, () => {
                    var xWhenOverlap = boss.x;
                    var yWhenOverlap = boss.y;
                    
                    // Gives player half a second to avoid damage, or else the boss is too deadly
                    this.time.delayedCall(500, () => {
                        // If distance from player to boss is under 200px, the player gets hit
                        var diffX = Math.abs(xWhenOverlap - this.player.x);
                        var diffY = Math.abs(yWhenOverlap - this.player.y);
                        if(diffX <= 200 && diffY <= 200 && this.playerWasHit === false)
                        {
                            this.bossSwing.play( { volume: 0.8 } );
                            this.boss.play({
                                key: 'Attack',
                                repeat: 3,
                                ignoreIfPlaying: false
                            });
                            this.boss.once('animationcomplete', () => {
                                this.boss.play({
                                    key: 'Moving',
                                    repeat: -1,
                                    ignoreIfPlaying: true
                                });
                            });
                            this.playerHit();
                        }
                    });
                });

                this.input.once('pointerdown', () => {     
                    this.bossHit();
                });

                // Starts movement and attacks
                this.time.addEvent({
                    delay: 1000,
                    startAt: 1000,
                    callback: () => {
                        this.bossControl(boss)
                    },
                    loop: true
                });
                this.rocksTimer();
            },
            removeCallback: () => {
                this.activeEnemies--;
            }
        });
    }

    bossControl(boss)
    {
        console.log('Calling boss control')
        // Gets random x & y to move to.
        do {
            var x = boss.x + (randoms.randomBetweenXY(100, 250) * randoms.randomPosOrNeg());
        } while(x < 115 || x > 685);
        do {
            var y = boss.y + (randoms.randomBetweenXY(100, 250) * randoms.randomPosOrNeg());
        } while(y < 115 || y > 685);

        // Smoothly transitions to the new location.
        this.tweens.add({
            targets: boss,
            x: x,
            y: y,
            duration: 750,
            ease: 'Power1',
        });
    }

    deathHandler(enemy)
    {
        this.physics.overlap(enemy, this.player, () => {
            this.input.once('pointerdown', () => {     
                this.hitSoundsEnemy();
                enemy.destroy();
            });
        });
    }

    spawnEnemies()
    {
        if(this.activeEnemies < 15 && this.pestsLeft > 0)
        {                  
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    if(this.aphidGroup && !this.flashed)
                    {
                        if(!this.aphidGroup.isFull())
                        {
                            this.aphidGroup.create();
                        }
                    }
                }
            });
                
            this.time.addEvent({
                delay: 1000,
                callback: () => {
                    if(this.waspGroup && !this.flashed)
                    {
                        if(!this.waspGroup.isFull() && this.pestsLeft <= 80)
                        {
                                this.waspGroup.create();
                        }
                    }
                }
            });
        }
        else if(this.pestsLeft <= 0 && !this.bossSpawned)
        {
            // Clear out any leftover bugs
            if(!this.flashed)
            {
                this.flash.flash(1000);
                this.flashed = true;

                this.aphidGroup.clear(true, true);
                this.waspGroup.clear(true, true);
            }

            

            this.time.addEvent({
                delay: 5000,
                callback: () => {
                    if(!this.bossGroup.isFull())
                    {
                        this.bossGroup.create();
                        this.bgm.stop();
                        this.bossBgm.play( { volume: 0.75 } );
                    } 
                }
            });
        }
    }

    rocksAttack()
    {
        for(var i = 0; i < 6; i++)
        {            
            var x = this.boss.x;
            var y = this.boss.y;

            this.rocks.play();
            this.rocksGroup.create(x, y);
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
        if(this.pestsLeft < 0)
        {
            this.pestsLeft = 0;
        }
        
        if(this.lives < 0)
        {
            this.lives = 0;
        }

        this.statusText.setText('Pests: ' + this.pestsLeft);
        this.lifeText.setText('Lives: ' + this.lives);
    }

    checkHit()
    {
        // When player overlaps an enemy, check each enemy in the group
        // to see if it's the one overlapping the player. If so,
        // remove and destroy it.

        // Aphids
        // this.aphidGroup.children.each((aphid) => { 
        //     this.physics.overlap(this.player, aphid, () => {
        //         this.hitSoundsEnemy();
        //         aphid.destroy();
        //     });
        // });
        
        // Wasps
        this.waspGroup.children.each((wasp) => { 
            this.physics.overlap(this.player, wasp, () => {
                this.hitSoundsEnemy();
                wasp.destroy();
            });
        });   

        // Boss
        if(this.bossSpawned)
        {
            this.physics.overlap(this.player, this.boss, () => {
                this.bossHit(this.boss);
            });
        }
    }

    playerHit()
    {
        // If player is not flagged as just being hit, sound plays and damage is dealth. Then flashes and becomes invulnerable for 1.5 seconds
        // Flag is enabled after the hit and disabled after 1.5 seconds
        if(this.playerWasHit === false)
        {
            this.playerWasHit = true;            

            this.time.delayedCall(250, () => {
                this.ouch.play( { volume: 0.6 } );
                this.lives--;
                
                // Checks for player death and triggers game over sequence.
                if(this.lives === 0)
                {
                    this.sound.stopAll();

                    this.lose.play();        
                    this.player.destroy();  
                    this.playerWasHit = false;

                    // Fades out to transition to win screen.
                    this.cameras.main.fadeOut(1000, 0, 0, 0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                        this.scene.start('lose');
                    });
                }

                this.player.setTint(0xaa0000);
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
            });
        }
    }

    bossHit(boss)
    {
        // If boss is flagged as just being hit, flashes and becomes invulnerable for 2 seconds
        if(this.bossWasHit === false)
        {
            this.bossWasHit = true;

            this.time.delayedCall(250, () => {
                this.hitSoundsBoss();
                this.bossLife--;

                boss.setTint(0xaa0000);

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
    // Allows repeating events such as spawns

    spawnTimers()
    {
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.spawnEnemies();
            },
            loop: true
        });
    }

    rocksTimer()
    {
        if(this.bossSpawned === true)
        {
            this.time.addEvent({
                delay: randoms.randomBetweenXY(5000, 15000),
                callback: () => {
                    this.rocksGroup.destroy();
                    this.rocksInit();
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
            delay: 30000,
            callback: () => {
                this.getLife.play( { volume: 0.7 } );
                if(this.lives < 10)
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

