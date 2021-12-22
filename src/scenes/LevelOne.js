import Phaser from 'phaser';

export default class LevelOne extends Phaser.Scene
{
    preload()
    {
        // The player sprite will follow the mouse cursor.
        // This removes the arrow from the cursor.
        this.sys.canvas.style.cursor = 'none';
    }
    create()
    {
        this.add.image(400, 400, 'garden');
        console.log('added background')
        this.player = this.add.sprite(400, 400, 'player');
        console.log('added sprite')
        const bgm = this.sound.add('bgm');
        console.log('added audio')
        bgm.play();
        
        // Allows clicking to change the animation.
        // Animation resets when not clicking.
        this.input.on('pointerdown', () => { 
            this.player.play('Attacking', true)});
        this.input.on('pointerup', () => { 
            this.player.play('Resting', false)});
    }
    update()
    {
        const pointer = this.input.activePointer;
        
        this.player.x = pointer.worldX;
        this.player.y = pointer.worldY;
    }
}