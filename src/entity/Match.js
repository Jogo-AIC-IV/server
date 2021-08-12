const { v4: uuidv4 } = require('uuid');
const Colors = require('../constants/TerminalColors');
const createPlayer = require('./Player');

function createMatch(firstUser, secondUser) {
    return {
        id: uuidv4(),
        startTick: 0,
        state: {
            first_player: createPlayer(firstUser),
            second_player: createPlayer(secondUser),
        },

        getPlayerById(playerId) {
            return this.state.first_player.id == playerId ? this.state.first_player : this.state.second_player;
        },  
    }
}

module.exports = createMatch 