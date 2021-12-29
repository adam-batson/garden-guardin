import Phaser from 'phaser';

// Game background
import garden from '../assets/images/garden.png';

// Player lives icon
import glove from '../assets/images/glove.png';

// Spade player sprites
import spade from '../assets/images/spade/Spade.png';
import spadeAnims from '../assets/images/spade/Spade.json';

// Aphid enemy sprites
import aphid from '../assets/images/aphid/Aphid.png';
import aphidAnims from '../assets/images/aphid/Aphid.json';

// Parcel requires audio to be imported this way
const bgmUrl = new URL('../assets/sounds/Still-Pickin.mp3', import.meta.url);
const bossUrl = new URL('../assets/sounds/corncob-by-kevin-macleod-from-filmmusic-io.mp3', import.meta.url);
const hitUrl = new URL('../assets/sounds/hit.mp3', import.meta.url);
const swingUrl = new URL('../assets/sounds/swing.mp3', import.meta.url);

export default class Preload extends Phaser.Scene
{
    preload()
    {
        // Image preload
        this.load.image('garden', garden);
        this.load.image('glove', glove);
        
        // Sprite preload
        this.load.aseprite('player', spade, spadeAnims);
        this.load.aseprite('aphid', aphid, aphidAnims);

        // Audio preload
        this.load.audio('bgm', `${bgmUrl}`);
        this.load.audio('boss-theme', `${bossUrl}`);
        this.load.audio('hit-sound', `${hitUrl}`);
        this.load.audio('swing', `${swingUrl}`);
    }
    create()
    {
        // Pre-create animations
        this.anims.createFromAseprite('player');
        this.anims.createFromAseprite('aphid');
        this.scene.start('title-screen');
        //this.scene.start('game')
    }
}