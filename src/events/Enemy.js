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
    const player = this.game.getPlayerBySocketId(socketId);

    if (!player) {
        console.log(`'${socketId}' não faz parte dessa partida.`)
        return this.socket.emit('ERROR', { type: 'enemy', message: 'Esse jogador não faz parte dessa partida.' });
    }
    
    const enemy = createEnemy();

    console.log(`Enemy '${enemy.id}' generated`);

    player.enemies.list.push(enemy);
    player.enemies.count++;

    this.game.io.to(matchId).emit('ENEMY_ADDED', { 
        player: this.socket.id, 
        enemy
    })
}

module.exports = Enemy;