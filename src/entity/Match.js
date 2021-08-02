const { v4: uuidv4 } = require('uuid');

function createMatch(firstPlayer, secondPlayer) {

    const match = {
        id: uuidv4(),
        state: {
            first_player: createMatchPlayer(firstPlayer),
            second_player: createMatchPlayer(secondPlayer),
        },

        runTurn: function() {
                
        }
    }

    return match;
}

function createMatchPlayer(player) {
    return {
        id: player.id,
        name: player.name,
        life: 3,
        price: 100,
        money: 350,
        total_tier: 0,
        enemies: {
            count: 0,
            first: 0,
            list: []
        },
        towers: {
            types: [],
            list: [],
        }
    }
}

module.exports = createMatch 