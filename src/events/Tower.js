const Colors = require('../constants/TerminalColors');
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
    const socketId = this.socket.id;
    const matchId = this.game.inMatch[socketId];
    const match = this.game.matches[matchId];
    const player = this.game.getPlayerBySocketId(socketId);
    const playerKey = match.state.first_player.id == player._id ? 'first_player' : 'second_player';
    const matchPlayer = match.state[playerKey];

    if (!matchPlayer) {
        console.log(`'${socketId}' não faz parte dessa partida.`)
        return this.socket.emit('ERROR', { type: 'tower', message: 'Esse jogador não faz parte dessa partida.' });
    }
    
    const towerType = match.getRandomTowerType(matchPlayer);
    const tower = createTower(towerType);

    Colors.printColored('FgCyan', `\tPlayer '${matchPlayer.username}' added tower`);
    Colors.printColored('FgCyan', `\tTowerType '${towerType.effect}' generated`);
    Colors.printColored('FgCyan', `\tTower '${tower.id}' generated`);

    matchPlayer.towers.list.push(tower);

    this.game.io.to(matchId).emit('TOWER_ADDED', { 
        player: {
            id: matchPlayer.id,
            name: matchPlayer.name
        },
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
        return this.socket.emit('ERROR', { type: 'tower', message: 'O jogador não possui essas torres.' });
    }

    if (towerDestroy.tier != towerUpgrade.tier) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'Torres com tiers diferentes não podem ser combinadas.' });
    }

    towerUpgrade.bullets.damage += 1;
    towerUpgrade.bullets.speed  += 3;
    towerUpgrade.bullets.size   += 1;
    towerUpgrade.bullets.buffer_max -= 8;
    towerUpgrade.tier += 1;
    // towerUpgrade.sprite.tint = PIXI.utils.rgb2hex(TURRET_COLORS[towerUpgrade.tier]);

    match.total_tier += 1;
    
    matchPlayer.towers.list.splice(indexTowerDestroy, 1);

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