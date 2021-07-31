function createMatch(firstPlayer, secondPlayer) {

    const match = {
        id: Math.floor(Math.random() * 1000),
        state: {},

        runTurn: function() {
            
        }
    }

    match.state[firstPlayer.socket.id] = {
        name: firstPlayer.name,
        life: 3,
        price: 100,
        money: 350,
        enemies: {
            count: 0,
            first: 0,
            list: []
        },
        towers: {
            list: [],
            types: []
        }
    }

    match.state[secondPlayer.socket.id] = {
        name: secondPlayer.name,
        life: 3,
        price: 100,
        money: 350,
        enemies: {
            count: 0,
            first: 0,
            list: []
        },
        towers: {
            list: [],
            types: []
        }
    }

    return match;
}

module.exports = createMatch 