const createTower = require('../entity/Tower');

const Tower = function (game, socket) {
    this.game = game;
    this.socket = socket;

    this.handler = {
        ADD_TOWER:     add.bind(this),
        COMBINE_TOWER: combine.bind(this),
    };
}

// Events

function add() {
    console.log(`Socket '${this.socket.id}' add tower`);

    const socketId = this.socket.id;
    const matchId = this.game.inMatch[socketId];
    const match = this.game.matches[matchId];

    const tower = createTower();

    if (!match.state[socketId])
        return this.socket.emit('ERROR', 'Esse jogador não faz parte dessa partida.');

    match.state[socketId].towers.list.push(tower);

    this.game.matches[matchId] = match;

    this.game.io.to(matchId).emit('TOWER_ADDED', { 
        player: this.socket.id, 
        tower
    })
}

function combine(firstTowerId, secondTowerId) {
    console.log(`Socket '${this.socket.id}' combine tower '${firstTowerId}' and '${secondTowerId}'`);

    const socketId = this.socket.id;
    const matchId = this.game.inMatch[socketId];
    const match = this.game.matches[matchId];
    const matchPlayer = match.state[socketId];

    let indexTowerDestroy = matchPlayer.towers.list.findIndex(tower => (tower.id == firstTowerId));
    let indexTowerUpgrade = matchPlayer.towers.list.findIndex(tower => (tower.id == secondTowerId));

    let towerDestroy = matchPlayer.towers.list[indexTowerDestroy];
    let towerUpgrade = matchPlayer.towers.list[indexTowerUpgrade];
    
    if (!towerDestroy || !towerUpgrade) {
        return this.socket.emit('ERROR', { message: 'O jogador não possui essas torres.' });
    }

    if (towerDestroy.tier != towerUpgrade.tier) {
        return this.socket.emit('ERROR', { message: 'Torres com tiers diferentes não podem ser combinadas.' });
    }

    towerUpgrade.bullets.damage += 1;
    towerUpgrade.bullets.speed  += 3;
    towerUpgrade.bullets.size   += 1;
    towerUpgrade.bullets.buffer_max -= 8;
    towerUpgrade.tier += 1;
    // towerUpgrade.sprite.tint = PIXI.utils.rgb2hex(TURRET_COLORS[towerUpgrade.tier]);

    match.total_tier += 1;
    
    towerDestroy.destroy();
    matchPlayer.towers.list.splice(indexTowerDestroy, 1);

    match.state[socketId] = matchPlayer;
    this.game.matches[matchId] = match;

    this.game.io.to(matchId).emit('TOWER_COMBINED', { 
        player: this.socket.id, 
        tower_upgrade: { 
            index: indexTowerUpgrade, 
            tower: towerUpgrade 
        },
        tower_destroy: {
            index: indexTowerDestroy,
            tower: towerDestroy
        }
    })
}

module.exports = Tower;