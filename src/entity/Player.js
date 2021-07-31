function createPlayer(socket, name) {
    return {
        id: socket.id,
        socket,
        name,
    }
}

module.exports = createPlayer