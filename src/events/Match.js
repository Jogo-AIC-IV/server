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
    console.log(`Socket '${this.socket.id}' start searching`);

    this.game.searchMatch(this.socket.id);
}

function stop() {
    console.log(`Socket '${this.socket.id}' stop searching`);

    delete this.game.playersSearching[this.socket.id];
}

function quit() {
    console.log(`Socket '${this.socket.id}' quit match`);

    const matchId = this.game.inMatch[this.socket.id];

    this.game.finishMatch(matchId);
}

module.exports = Match;