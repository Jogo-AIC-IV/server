const Colors = require('../constants/TerminalColors');
const createTower = require('../entity/Tower');
const TowerType = require('../models/TowerType');
const towerTypeModel = require('../models/TowerType');

const Tower = function (game, socket) {
    this.game = game;
    this.socket = socket;

    this.handler = {
        ADD_TOWER:     add.bind(this),
        COMBINE_TOWER: combine.bind(this),
        SELECT_TOWER_TYPES: selectTowerTypes.bind(this),
        ADD_TOWER_TYPE: addTowerType.bind(this),
        UP_TOWER_TYPE: updateTowerType.bind(this),
    };
}

// Events

function add() {
    const socketId = this.socket.id;
    const matchId = this.game.inMatch[socketId];
    const player = this.game.getPlayerInMatchBySocketId(matchId, socketId);

    if (!player) {
        console.log(`'${socketId}' não faz parte dessa partida.`)
        return this.socket.emit('ERROR', { type: 'tower', message: 'Esse jogador não faz parte dessa partida.' });
    }
    
    const positionX = Math.floor(Math.random() * 500)
    const positionY = Math.floor(Math.random() * 250)

    const towerType = player.getRandomTowerType();
    const tower = createTower(towerType, positionX, positionY);

    Colors.printColored('FgCyan', `\tPlayer '${player.username}' added tower`);
    Colors.printColored('FgCyan', `\tTowerType '${towerType.effect}' generated`);
    Colors.printColored('FgCyan', `\tTower '${tower.id}' generated`);

    player.towers.list.push(tower);

    this.game.emitToMatch(matchId,'TOWER_ADDED', { 
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

    player.totalTier += 1;
    player.towers.list.splice(indexTowerDestroy, 1);

    this.game.emitToMatch(matchId, 'TOWER_COMBINED', { 
        player: {
            id: player.id,
            username: player.username,
            totalTier: player.totalTier,
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


function selectTowerTypes(towerTypes) {

    if (towerTypes.length < 5) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'O jogador deve escolher no mínimo 5 torres' });
    }

    const user = this.game.getUserBySocketId()
}

async function addTowerType(data) {
    try {
        await towerTypeModel.create(data);
    
        return this.socket.emit('INFO', { status: true, message: 'Tower type adicionado.' });
    } catch (error) {
        console.error(error)
        return this.socket.emit('ERROR', { type: 'tower', message: 'Falha ao adicionar o tower type' });
    }
}

function updateTowerType({ tower_type_id }) {
    const socketId = this.socket.id;
    const matchId = this.game.inMatch[socketId];
    const player = this.game.getPlayerInMatchBySocketId(matchId, socketId);
    const towerTypes = player.towers.types;

    for(let i=0; i<towerTypes.length; i++) {
        if (towerTypes[i].id == tower_type_id) {
            const towerType = towerTypes[i];

            console.log(`Upando tower type ${towerType.name}`);

            towerType.range += 10
            towerType.rate -= 1
            towerType.bullet.damage += 1;
            towerType.bullet.speed += 4;
            towerType.bullet.size += 1;

            return this.game.emitToMatch(matchId, 'TOWER_TYPE_UP', { 
                player: {
                    id: player.id,
                    username: player.username
                }, 
                tower_type: { 
                    index: i, 
                    type: towerType 
                }
            })
        }
    }

    return this.socket.emit('ERROR', { type: 'tower', message: 'Tipo de torre não encontrado.' })
}

module.exports = Tower;