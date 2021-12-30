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
        this.pestsLeft = 100;
        this.lives = 3;
    
        // Wave and spawn control variables
        this.activeEnemies = 0;
        this.aphidsSpawned = 0;
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
        this.bossSwing = this.sound.add('boss-swing');
        this.buzz = this.sound.add('buzz');
        this.ouch = this.sound.add('ouch');
        this.getLife = this.sound.add('get-life');
        this.rocks = this.sound.add('rocks');

        this.bgm = this.sound.add('bgm', { loop: true });
        this.bossBgm = this.sound.add('boss-theme', { loop: true });

        this.bgm.play( { volume: 0.75 } );

        // Fades in to allow player to begin
        this.cameras.main.fadeIn(500, 0, 0, 0);        

        // Init status text
        this.initStatus();

        // Start life gain timer
        this.lifeGainTimer();

        // Start enemy spawn timer
        this.spawnTimer();

        // Start enemy move timer
        this.moveTimers();        
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
    }

    playerAttack()
    {
        this.player.play('Spade-down', true);
        this.swingSound.play();
        this.checkKill();
    }

    // Groups init and control
    initGroups()
    {
        this.initAphids();
        this.initWasps();
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
        aphid.body.setCollideWorldBounds(true, 1, 1);
    }

    aphidControl(aphid)
    {
        // Gets random x & y to move to.
        do {
            var x = aphid.x + (randoms.randomBetweenXY(25, 50) * randoms.randomPosOrNeg());
        } while(x < 10 || x > 790);
        do {
            var y = aphid.y + (randoms.randomBetweenXY(25, 50) * randoms.randomPosOrNeg());
        } while(y < 10 || y > 790);

        // Change aphid facing
        var rotateTo = new RotateTo(aphid);
        rotateTo.rotateTowardsPosition(x, y, 0, 800);

        // Smoothly transitions to the new location.
        this.tweens.add({
            targets: aphid,
            x: x,
            y: y,
            duration: 200,
            delay: 250,
            ease: 'SineIn',
        });
    }

    initWasps()
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

        wasp.setName('aphid' + this.waspGroup.getLength())
            .setDepth(1)
            .setOrigin(0.5, 0.5)
            .setScale(0.75, 0.75)
            .play({
                key: 'Flying',
                repeat: -1,
                ignoreIfPlaying: true
            });
        this.physics.add.existing(wasp);
        wasp.body.setCollideWorldBounds(true, 1, 1);
    }

    waspControl(wasp)
    {
        // Gets random x & y to move to.
        do {
            var x = wasp.x + (randoms.randomBetweenXY(75, 150) * randoms.randomPosOrNeg());
        } while(x < 10 || x > 790);
        do {
            var y = wasp.y + (randoms.randomBetweenXY(75, 150) * randoms.randomPosOrNeg());
        } while(y < 10 || y > 790);

        // Smoothly transitions to the new location.
        this.tweens.add({
            targets: wasp,
            x: x,
            y: y,
            duration: 300,
            delay: Phaser.Math.RND.between(100, 300),
            ease: 'Expo',
        });

        // Check if wasp can hit player
        this.physics.overlap(wasp, this.player, () => {
            this.buzz.play();
            this.time.delayedCall(500, () => {
                wasp.play({
                    key: 'Attacking',
                    repeat: 2,
                    ignoreIfPlaying: false
                });
                this.ouch.play( { volume: 0.6 } );
                this.lives--;
            });
        });
    }

    initBoss()
    {
        // Create the boss
        this.boss = this.add.sprite(400, 400, 'boss')
            .setDepth(1)
            .setOrigin(0.5, 0.5)
            .setScale(2, 2)
            .play({
                key: 'Moving',
                repeat: -1,
                ignoreIfPlaying: true
            });
        this.physics.add.existing(this.boss);
        this.boss.body.setCollideWorldBounds(true, 1, 1);

        this.bgm.stop();
        this.bossBgm.play( { volume: 0.75 } );
    }

    bossControl()
    {
        // Gets random x & y to move to.
        do {
            var x = wasp.x + (randoms.randomBetweenXY(75, 150) * randoms.randomPosOrNeg());
        } while(x < 10 || x > 790);
        do {
            var y = wasp.y + (randoms.randomBetweenXY(75, 150) * randoms.randomPosOrNeg());
        } while(y < 10 || y > 790);

        // Smoothly transitions to the new location.
        this.tweens.add({
            targets: this.boss,
            x: x,
            y: y,
            duration: 500,
            delay: Phaser.Math.RND.between(100, 200),
            ease: 'Power1',
        });

        // Check if boss can hit player
        this.physics.overlap(this.boss, this.player, () => {
            this.time.delayedCall(500, this.boss.play({
                key: 'Attack',
                repeat: 0,
                ignoreIfPlaying: false
            }))
            this.bossSwing.play( { volume: 0.6 } );
            this.time.delayedCall(500, this.ouch.play( { volume: 0.6 } ));
            this.lives--; 
        });
    }

    rockAttack()
    {
        var x = this.boss.x;
        var y = this.boss.y;

        this.rockGroup = this.add.group({
            defaultKey: 'rock',
            maxSize: 6,
            createMultipleCallback: (rock) => {
                this.rocks.play( { volume: 0.4 } );                
                var moveTo = new MoveTo(rock);
                moveTo.moveAway(x, y);
                rock.play({
                    key: 'Rolling',
                    ignoreIfPlaying: true
                });
                this.physics.overlap(rock, this.player, () => {
                    rock.destroy();
                    this.hit.play( { volume: 0.7 } );
                    this.time.delayedCall(500, this.ouch.play( { volume: 0.5 } ));
                    this.lives--;
                })
            }
        });

        this.rockGroup.createMultiple({
            quantity: 6,
            setRotation: {
                value: Phaser.Math.Angle.between(x, y, this.player.x, this.player.y),
                step: 60
            }
        });
    }

    // Status text init and control
    initStatus()
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
            this.aphidGroup.children.each((child) => this.physics.overlap(this.player, child, () => {
                this.hitSounds();
                this.aphidGroup.remove(child, true, true)})
            )}
        );
        
        // Wasps
        this.physics.overlap(this.player, this.waspGroup, () => { 
            this.waspGroup.children.each((child) => this.physics.overlap(this.player, child, () => {
                this.hitSounds();
                this.waspGroup.remove(child, true, true)})
            )}
        );

        // Boss
        this.physics.overlap(this.player, this.boss, () => { 
            this.hitSounds();
            this.bossHits++;
            this.time.addEvent({
                delay: 250,
                repeat: true,
                repeatCount: 3,
                callback: () => {
                    this.bossGroup.setTint(0xffffff);
                },
            });
            
            this.time.addEvent({
                delay: 750,
                repeat: true,
                repeatCount: 3,
                callback: () => {
                    this.bossGroup.clearTint();
                }
            });
            
            if(bossHits == 20)
            {
                this.bossGroup.remove(child, true, true);
            }
        });
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
        if(this.pestsLeft >= 0 && this.activeEnemies < 20)
        {                  
            if(!this.aphidGroup.isFull())
            {
                this.time.addEvent({
                    delay: 1500,
                    callback: () => {
                        this.aphidGroup.create();
                    }
                });
            }
                 
            if(/*this.aphidsSpawned >= 20 && */!this.waspGroup.isFull())
            {
                this.time.addEvent({
                    delay: 2500,
                    callback: () => {
                        this.waspGroup.create();
                    }
                });
            }

            if(this.pestsLeft === 0 && !this.boss)
            {
                this.time.addEvent({
                    delay: 5000,
                    callback: () => {
                        this.initBoss();
                    }
                });
            }
        } 
    }

    // Timers
    spawnTimer()
    {
        // Allows repeating events such as spawns and movement changes.
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
        this.time.addEvent({
            delay: 500,
            callback: () => {
                this.aphidGroup.children.each((child) => this.aphidControl(child), this);
            },
            loop: true
        });

        this.time.addEvent({
            delay: 750,
            callback: () => {
                this.waspGroup.children.each((child) => this.waspControl(child), this);
            },
            loop: true
        });
    }

    rockTimer()
    {
        if(this.boss)
        {
            this.time.addEvent({
                delay: randoms.randomBetweenXY(10000, 15000),
                callback: () => {
                    this.rockAttack();
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

/*  TODO
    Add iframes to player after lives--
    Add gameover scene instructing refresh to play again
*/