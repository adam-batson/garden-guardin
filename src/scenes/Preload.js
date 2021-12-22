import Phaser from 'phaser';
import garden from '../assets/images/garden.png';
import spade from '../assets/images/Spade.png';
import sprite from '../assets/images/Spade.json';

// Parcel requires audio to be imported this way
const bgmUrl = new URL('../assets/sounds/song18.mp3', import.meta.url);
const hitUrl = new URL('../assets/sounds/hit35.mp3.flac', import.meta.url);
     
export default class Preload extends Phaser.Scene
{
    preload()
    {     
        this.load.image('garden', garden);
        this.load.aseprite('player', spade, sprite);
        this.load.audio('bgm', `${bgmUrl}`);
        this.load.audio('hit-sound', `${hitUrl}`);
    }
    create()
    {
        this.anims.createFromAseprite('player');
        console.log('loaded sprite anims')
        this.scene.start('title-screen');
    }
}