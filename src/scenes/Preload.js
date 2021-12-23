import Phaser from 'phaser';

// Game background
import garden from '../assets/images/garden.png';

// Spade player sprites
import spade from '../assets/images/spade/Spade.png';
import spadeSprite from '../assets/images/spade/Spade.json';

// Aphid enemy sprites
import aphid from '../assets/images/aphid/Aphid.png';
import aphidSprite from '../assets/images/aphid/Aphid.json';

// Parcel requires audio to be imported this way
const bgmUrl = new URL('../assets/sounds/Still-Pickin.mp3', import.meta.url);
const bossUrl = new URL('../assets/sounds/corncob-by-kevin-macleod-from-filmmusic-io.mp3', import.meta.url);
const hitUrl = new URL('../assets/sounds/hit.mp3', import.meta.url);
const swingUrl = new URL('../assets/sounds/swing.mp3', import.meta.url);

export default class Preload extends Phaser.Scene
{
    preload()
    {     
        this.load.image('garden', garden);
        this.load.aseprite('player', spade, spadeSprite);
        this.load.aseprite('aphid', aphid, aphidSprite);
        this.load.audio('bgm', `${bgmUrl}`);
        this.load.audio('boss-theme', `${bossUrl}`);
        this.load.audio('hit-sound', `${hitUrl}`);
        this.load.audio('swing', `${swingUrl}`);
    }
    create()
    {
        this.anims.createFromAseprite('player');
        this.anims.createFromAseprite('aphid');
        this.scene.start('title-screen');
    }
}