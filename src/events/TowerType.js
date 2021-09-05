const Colors = require('../constants/TerminalColors');
const UserService = require('../service/UserService')();
const towerTypeService = require('../service/TowerTypeService')();

const MAX_TOWER_TYPES = 3;

const TowerType = function (game, socket) {
    this.game = game;
    this.socket = socket;

    this.handler = {
        BUY_TOWER_TYPE: buy.bind(this),
        ADD_TOWER_TYPE: add.bind(this),
        UPGRADE_TOWER_TYPE: upgrade.bind(this),
        TOGGLE_TOWER_TYPE: toggle.bind(this),
    };
}

// Events

async function buy({ towerTypeId }) {
    console.log(`Buy towerType id ${towerTypeId}`)

    const towerType = await towerTypeService.getById(towerTypeId);

    if (!towerType) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'Torre não encontrada.' });
    }

    const user = this.game.getUserBySocketId(this.socket.id)
    const userToSave = {...user};

    if (user.money < towerType.price) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'Você não possui saldo suficiente' });
    }

    // Seta os unlockeds para apenas os Ids (banco salva uma lista de ids e não o objeto)
    userToSave.unlockedTowerTypes = userToSave.unlockedTowerTypes.map(towerType => {
        return towerType.id
    });

    // Seta os selecteds para apenas os Ids (banco salva uma lista de ids e não o objeto)
    userToSave.selectedTowerTypes = userToSave.selectedTowerTypes.map(towerType => {
        return towerType.id
    });

    const towerTypeIndex = userToSave.selectedTowerTypes.indexOf(towerTypeId)
    if (towerTypeIndex != -1) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'Você já possui essa torre' });
    }

    user.money -= towerType.price;
    userToSave.money -= towerType.price;

    user.unlockedTowerTypes.push(towerType);
    userToSave.unlockedTowerTypes.push(towerTypeId);

    const status = await UserService.update(userToSave);

    if (status) {
        this.socket.emit('INFO', { status: true, message: `Torre '${towerType.name}' comprada!` });
        return this.socket.emit('UPDATE_USER_DATA', { user })
    }

    this.socket.emit('ERROR', { type: 'tower', message: 'Falha ao  atualizar no banco' });
}

async function add(data) {
    const towerType = await towerTypeService.create(data);

    if (!towerType) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'Falha ao adicionar o tower type' });
    }

    this.game.towerTypes[towerType.id] = towerType;

    return this.socket.emit('INFO', { status: true, message: 'Tower type adicionado.' });
}

async function toggle({ towerTypeId })
{
    console.log(`toggle evento com towerTypeId: ${towerTypeId}`)
    const towerType = await towerTypeService.getById(towerTypeId);

    if (!towerType) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'Torre não encontrada.' });
    }
    
    const user = this.game.getUserBySocketId(this.socket.id)
    const userToSave = {...user};

    // Seta os unlockeds para apenas os Ids (banco salva uma lista de ids e não o objeto)
    userToSave.unlockedTowerTypes = userToSave.unlockedTowerTypes.map(towerType => {
        return towerType.id
    });

    // Seta os selecteds para apenas os Ids (banco salva uma lista de ids e não o objeto)
    userToSave.selectedTowerTypes = userToSave.selectedTowerTypes.map(towerType => {
        return towerType.id
    });

    const towerTypeIndex = userToSave.selectedTowerTypes.indexOf(towerTypeId)
    if (towerTypeIndex == -1) {
        if (user.selectedTowerTypes.length >= MAX_TOWER_TYPES) {
            return this.socket.emit('ERROR', { type: 'tower', message: 'Limite de torres selecionadas atingido.' });
        }
        
        user.selectedTowerTypes.push(towerType);
        userToSave.selectedTowerTypes.push(towerTypeId);

        this.socket.emit('INFO', { status: true, message: `Torre '${towerType.name}' selecionada.` });
    } else {
        user.selectedTowerTypes.splice(towerTypeIndex, 1);
        userToSave.selectedTowerTypes.splice(towerTypeIndex, 1);

        this.socket.emit('INFO', { status: true, message: `Torre '${towerType.name}' deselecionada.` });
    }

    const status = await UserService.update(userToSave);

    if (status) {
        return this.socket.emit('UPDATE_USER_DATA', { user })
    }

    this.socket.emit('ERROR', { type: 'tower', message: 'Falha ao atualizar no banco.' });
}

function upgrade({ towerTypeId }) {
    const socketId = this.socket.id;
    const matchId = this.game.inMatch[socketId];
    const player = this.game.getPlayerInMatchBySocketId(matchId, socketId);
    const towerType = player.getTowerTypeById(towerTypeId);

    if (!towerType) {
        return this.socket.emit('ERROR', { type: 'tower', message: 'Torre não encontrado.' })
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