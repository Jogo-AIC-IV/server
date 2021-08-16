const Colors = require('../constants/TerminalColors');
const UserService = require('../service/UserService')();
const towerTypeService = require('../service/TowerTypeService')();

const TowerType = function (game, socket) {
    this.game = game;
    this.socket = socket;

    this.handler = {
        ADD_TOWER_TYPE: add.bind(this),
        SELECT_TOWER_TYPES: select.bind(this),
        UPGRADE_TOWER_TYPE: upgrade.bind(this),
    };
}

// Events

async function add(data) {
    const towerType = await towerTypeService.create(data);

    if (!towerType) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'Falha ao adicionar o tower type' });
    }

    this.game.towerTypes[towerType.id] = towerType;

    return this.socket.emit('INFO', { status: true, message: 'Tower type adicionado.' });
}

async function select({ towerTypesId }) {

    if (towerTypesId.length < 1) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'O jogador deve escolher no mínimo uma torre' });
    }

    const towerTypes = await towerTypeService.getByArrayIds(towerTypesId);

    if (!towerTypes) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'Falha ao carregar os tipos' });
    }

    const user = this.game.getUserBySocketId(this.socket.id)
    const userCopy = {...user};

    userCopy.unlockedTowerTypes = userCopy.unlockedTowerTypes.map(towerType => {
        return towerType.id
    });

    towerTypesId.forEach(towerTypeId => {
        if (userCopy.unlockedTowerTypes.includes(towerTypeId) == false) {
            return this.socket.emit('ERROR', { type: 'tower', message: 'O usuário não possui essa torre liberada' });
        }
    });

    user.selectedTowerTypes = towerTypes;
    userCopy.selectedTowerTypes = towerTypesId;

    const status = await UserService.update(userCopy);

    if (status) {
        return this.socket.emit('SELECTED_TOWER_TYPES_SUCCESS', { success: true, user: userCopy })
    }

    this.socket.emit('ERROR', { type: 'tower', message: 'Falha ao atualizar os tower types' });
}

function upgrade({ towerTypeId }) {
    const socketId = this.socket.id;
    const matchId = this.game.inMatch[socketId];
    const player = this.game.getPlayerInMatchBySocketId(matchId, socketId);
    const towerType = player.getTowerTypeById(towerTypeId);

    if (!towerType) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'Tipo de torre não encontrado.' })
    }

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
        towerType
    })
}

module.exports = TowerType;