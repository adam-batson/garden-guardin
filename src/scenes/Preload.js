import Phaser from 'phaser';

// Game background
import garden from '../assets/images/garden.png';

// Player lives icon
import glove from '../assets/images/life/Glove.png';
import gloveAnims from '../assets/images/life/Glove.json';

// Spade player sprites
import spade from '../assets/images/spade/Spade.png';
import spadeAnims from '../assets/images/spade/Spade.json';

// Aphid enemy sprites
import aphid from '../assets/images/aphid/Aphid.png';
import aphidAnims from '../assets/images/aphid/Aphid.json';

// Parcel requires audio to be imported this way
const bgmUrl = new URL('../assets/audio/music/Still-Pickin.mp3', import.meta.url);
const bossBgmUrl = new URL('../assets/audio/music/corncob-by-kevin-macleod-from-filmmusic-io.mp3', import.meta.url);
const hitUrl = new URL('../assets/audio/sfx/hit.mp3', import.meta.url);
const swingUrl = new URL('../assets/audio/sfx/swing.mp3', import.meta.url);
const enemyHurtUrl = new URL('../assets/audio/sfx/enemy-hit.mp3', import.meta.url);
const bossHurtUrl = new URL('../assets/audio/sfx/boss-hit.mp3', import.meta.url);
const buzzUrl = new URL('../assets/audio/sfx/buzz.mp3', import.meta.url);
const ouchUrl = new URL('../assets/audio/sfx/ouch.mp3', import.meta.url);


export default class Preload extends Phaser.Scene
{
    preload()
    {
        // Image preload
        this.load.image('garden', garden);
        
        // Sprite preload
        this.load.aseprite('player', spade, spadeAnims);
        this.load.aseprite('aphid', aphid, aphidAnims);
        this.load.aseprite('life', glove, gloveAnims);

        // Audio preload
        this.load.audio('bgm', `${bgmUrl}`);
        this.load.audio('boss-theme', `${bossBgmUrl}`);
        this.load.audio('hit-sound', `${hitUrl}`);
        this.load.audio('swing', `${swingUrl}`);
        this.load.audio('enemy-hit', `${enemyHurtUrl}`);
        this.load.audio('boss-hit', `${bossHurtUrl}`);
        this.load.audio('buzz', `${buzzUrl}`);
        this.load.audio('ouch', `${ouchUrl}`);

    }

    create()
    {
        // Pre-create animations
        this.anims.createFromAseprite('player');
        this.anims.createFromAseprite('aphid');
        
        this.time.delayedCall(1000, this.scene.start('title-screen'));
    }
}