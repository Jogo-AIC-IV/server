function createMatch(firstPlayer, secondPlayer) {

    delete firstPlayer['socket'];
    delete secondPlayer['socket'];

    return {
        id: Math.floor(Math.random() * 1000),
        state: {
            firstPlayer,
            secondPlayer
        }
    }
}

module.exports = createMatch 