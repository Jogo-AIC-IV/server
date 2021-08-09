const Colors = require('../constants/TerminalColors');
const createTower = require('../entity/Tower');

const Tower = function (game, socket) {
    this.game = game;
    this.socket = socket;

    this.handler = {
        ADD_TOWER:     add.bind(this),
        COMBINE_TOWER: combine.bind(this),
        SELECT_TOWER_TYPES: selectTowerTypes.bind(this),
    };
}

// Events

function add() {
    const socketId = this.socket.id;
    const matchId = this.game.inMatch[socketId];
    const match = this.game.matches[matchId];
    const player = this.game.getPlayerInMatchBySocketId(matchId, socketId);

    if (!player) {
        console.log(`'${socketId}' não faz parte dessa partida.`)
        return this.socket.emit('ERROR', { type: 'tower', message: 'Esse jogador não faz parte dessa partida.' });
    }
    
    const positionX = Math.floor(Math.random() * 500)
    const positionY = Math.floor(Math.random() * 250)

    const towerType = match.getRandomTowerType(player);
    const tower = createTower(towerType, positionX, positionY);

    Colors.printColored('FgCyan', `\tPlayer '${player.username}' added tower`);
    Colors.printColored('FgCyan', `\tTowerType '${towerType.effect}' generated`);
    Colors.printColored('FgCyan', `\tTower '${tower.id}' generated`);

    player.towers.list.push(tower);

    this.game.io.to(matchId).emit('TOWER_ADDED', { 
        player: {
            id: player.id,
            usename: player.username
        },
        tower
    })
}

function combine(firstTowerId, secondTowerId) {
    console.log(`Socket '${this.socket.id}' combine tower '${firstTowerId}' and '${secondTowerId}'`);

    const socketId = this.socket.id;
    const matchId = this.game.inMatch[socketId];
    const match = this.game.matches[matchId];
    const player = this.game.getPlayerInMatchBySocketId(matchId, socketId);

    let indexTowerDestroy = player.towers.list.findIndex(tower => (tower.id == firstTowerId));
    let indexTowerUpgrade = player.towers.list.findIndex(tower => (tower.id == secondTowerId));

    let towerDestroy = player.towers.list[indexTowerDestroy];
    let towerUpgrade = player.towers.list[indexTowerUpgrade];
    
    if (!towerDestroy || !towerUpgrade) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'O jogador não possui essas torres.' });
    }

    if (towerDestroy.tier != towerUpgrade.tier) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'Torres com tiers diferentes não podem ser combinadas.' });
    }

    towerUpgrade.type.bullet.damage += 1;
    towerUpgrade.type.bullet.speed  += 3;
    towerUpgrade.type.bullet.size   += 1;
    towerUpgrade.type.rate -= 1;
    towerUpgrade.tier += 1;

    match.totalTier += 1;
    
    player.towers.list.splice(indexTowerDestroy, 1);

    this.game.io.to(matchId).emit('TOWER_COMBINED', { 
        player: {
            id: player.id,
            username: player.username
        }, 
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


function selectTowerTypes(towerTypesId) {
    if (!towerTypesId) {
        return console.log("sem tower types");
    }
}

module.exports = Tower;