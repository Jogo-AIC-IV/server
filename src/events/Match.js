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
    const user = this.game.getUserBySocketId(this.socket.id);

    Colors.printColored('FgGreen', `User '${user.username}' started searching`);

    this.game.searchMatch(this.socket.id);
}

function stop() {
    const user = this.game.getUserBySocketId(this.socket.id);

    Colors.printColored('FgGreen', `User '${user.username}' stopped searching`);

    delete this.game.usersSearching[this.socket.id];
}

function quit() {
    const user = this.game.getUserBySocketId(this.socket.id);

    Colors.printColored('FgYellow', `User '${user.username}' quited searching`);

    const matchId = this.game.inMatch[this.socket.id];

    this.game.finishMatch(matchId);
}

module.exports = Match;