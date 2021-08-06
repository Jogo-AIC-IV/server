const Colors = require('../constants/TerminalColors');

const Match = function (game, socket) {
    this.game = game;
    this.socket = socket;

    this.handler = {
        SEARCH_MATCH: search.bind(this), 
        SEARCH_STOP:  stop.bind(this), 
        QUIT_MATCH:   quit.bind(this)
    };
}

// Events

function search() {
    const player = this.game.getPlayerBySocketId(this.socket.id);

    Colors.printColored('FgGreen', `Player '${player.username}' started searching`);

    this.game.searchMatch(this.socket.id);
}

function stop() {
    const player = this.game.getPlayerBySocketId(this.socket.id);

    Colors.printColored('FgGreen', `Player '${player.username}' stopped searching`);

    delete this.game.playersSearching[this.socket.id];
}

function quit() {
    const player = this.game.getPlayerBySocketId(this.socket.id);

    Colors.printColored('FgYellow', `Player '${player.username}' quited searching`);

    const matchId = this.game.inMatch[this.socket.id];

    this.game.finishMatch(matchId);
}

module.exports = Match;