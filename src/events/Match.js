const createPlayer = require('../entity/Player');
const createMatch = require('../entity/Match');

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

function search({ getNPC }) {
    console.log(`Socket '${this.socket.id}' start searching`);

    if (this.game.playerIsInMatch(this.socket.id)) {
        return this.socket.emit('ERROR', { type: "match", message: "O jogador já está em uma partida." });
    }

    if (getNPC) {
        const enemy = createPlayer(null, 'NPC');
        const match = createMatch(player, enemy);

        this.game.matches[match.id] = match;

        return this.socket.emit('SETUP_MATCH', match.state);
    }

    const player = this.game.playersOnline[this.socket.id];

    this.game.playersSearching[this.socket.id] = player

    const enemy = this.game.getRandomPlayerSearching(this.socket.id);
  
    if (!enemy) {
        console.log(`Search '${this.socket.id}' not found enemy`);
        return this.socket.emit('ERROR', { type: 'search', message: 'Nenhum jogador encontrado.' });
    }

    console.log(`'${player.id}' Found enemy '${enemy.id}'`);

    const match = this.game.startMatch({...player}, {...enemy});

    this.game.matches[match.id] = match;

    enemy.socket.join(match.id);
    this.socket.join(match.id);

    this.game.io.to(match.id).emit('SETUP_MATCH', match.state)

    delete this.game.playersSearching[this.socket.id];
    delete this.game.playersSearching[enemy.socket.id];
}

function stop() {
    console.log(`Socket '${this.socket.id}' stop searching`);

    console.log(this.game.playersSearching);

    delete this.game.playersSearching[this.socket.id];

    console.log(this.game.playersSearching);
}

function quit() {
    console.log(`Socket '${this.socket.id}' quit match`);

    const matchId = this.game.inMatch[this.socket.id];
    const match = this.game.matches[matchId];

    let enemyId = null;

    if (match.state.first_player.id == this.socket.id) {
        enemyId = match.state.second_player.id; 
    } else {
        enemyId = match.state.first_player.id; 
    }

    console.log(`Removing '${enemyId}' from match ${matchId}`);

    const enemy = this.game.playersOnline[enemyId];

    this.game.io.to(matchId).emit('FINISH_MATCH', { quit: true });

    enemy.socket.leave(matchId);
    this.socket.leave(matchId);

    console.log(this.game.inMatch);

    delete this.game.inMatch[this.socket.id];
    delete this.game.inMatch[enemyId];
    delete this.game.matches[matchId];

    console.log(this.game.inMatch);
    console.log(this.game.matches);
}

module.exports = Match;