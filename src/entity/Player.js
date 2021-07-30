function createPlayer(socket, name) {
    return {
        id: Math.floor(Math.random() * 5000),
        socket,
        name,
        life: 100,
        dices: {
            '123': 1,
        }
    }
}

module.exports = createPlayer