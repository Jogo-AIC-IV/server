const createTower = require('../entity/Tower');

const Tower = function (game, socket) {
    this.game = game;
    this.socket = socket;

    this.handler = {
        ADD_TOWER: add.bind(this),
    };
}

// Events

function add() {
    const socketId = this.socket.id;
    const matchId = this.game.inMatch[socketId];
    const match = this.game.matches[matchId];

    const tower = createTower();

    match.state[socketId].towers = tower;

    this.game.matches[matchId] = match;
}

module.exports = Tower;