import Phaser from 'phaser';

// Random number generators
function randomPosOrNeg() // Returns -1 or 1
{
    do {
        var coord = Phaser.Math.RND.between(-1, 1);
    } while (coord === 0);

    return coord;
}

function randomEdgeSpawnPoint()
{
    return Phaser.Math.RND.between(0, 1) * 800;
}

function randomBetweenXY(x, y) // Sets X or Y coordinate for use in spawning and movement of enemies.
{
    return Phaser.Math.RND.between(x, y);
}

export {
    randomBetweenXY,
    randomEdgeSpawnPoint,
    randomPosOrNeg
};