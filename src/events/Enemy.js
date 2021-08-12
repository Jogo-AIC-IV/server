const createEnemy = require('../entity/Enemy');

const Enemy = function (game, socket) {
    this.game = game;
    this.socket = socket;

    this.handler = {
        ADD_ENEMY:     add.bind(this),
    };
}

// Events

function add() {
    console.log(`Socket '${this.socket.id}' add enemy`);

    const socketId = this.socket.id;
    const matchId = this.game.inMatch[socketId];
    const player = this.game.getPlayerInMatchBySocketId(matchId, socketId);

    if (!player) {
        console.log(`'${socketId}' não faz parte dessa partida.`)
        return this.socket.emit('ERROR', { type: 'enemy', message: 'Esse jogador não faz parte dessa partida.' });
    }

    const enemy = createEnemy('Mage');
    
    player.addEnemy(enemy);

    console.log(`\tCreating enemy ${enemy.name}`);

    this.game.emitToMatch(matchId,'ENEMY_ADDED', { 
        player: {
            id: player.id,
            username: player.username,
        }, 
        enemy
    })
}

module.exports = Enemy;