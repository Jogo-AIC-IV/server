const User = function (game, socket) {
    this.game = game;
    this.socket = socket;

    this.handler = {
        disconnect: disconnect.bind(this),
    };
}

// Events

function disconnect() {
    console.log(`Player '${this.socket.id}' disconnected`);
    
    delete this.game.playersOnline[this.socket.id]
    delete this.game.playersSearching[this.socket.id]

    console.log(this.game.matches);
}

module.exports = User;