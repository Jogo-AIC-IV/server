const createPlayer = require('../entity/Player');
const createMatch = require('../entity/Match');

const Match = function (game, socket) {
    this.game = game;
    this.socket = socket;

    this.handler = {
        SEARCH_MATCH: search.bind(this), 
        SEARCH_STOP:  stop.bind(this), 
    };
}

// Events

function search({ getNPC }) {
    if (getNPC) {
        const enemy = createPlayer(null, 'NPC');
        const match = createMatch(player, enemy);

        this.game.matches[match.id] = match;

        return this.socket.emit('SETUP_MATCH', match.state);
    }

    const player = this.game.playersOnline[this.socket.id];

    this.game.playersSearching[this.socket.id] = player

    const enemy = this.game.getRandomPlayerSearching(this.socket.id);
  
    if (!enemy)
        return this.socket.emit('SEARCH_NOTFOUND', { status: false, message: 'Nenhum jogador encontrado.' });

    const match = this.game.startMatch({...player}, {...enemy});

    enemy.socket.emit('SETUP_MATCH', match.state);
    this.socket.emit('SETUP_MATCH', match.state);

    delete this.game.playersSearching[this.socket.id];
}

function stop() {
    delete this.game.playersSearching[this.socket.id];
}

module.exports = Match;