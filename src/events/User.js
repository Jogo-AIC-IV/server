const createUser = require("../entity/User");

const User = function (game, socket) {
    this.game = game;
    this.socket = socket;

    this.handler = {
        LOGIN: login.bind(this),
        SIGNUP: signup.bind(this),
        disconnect: disconnect.bind(this),
    };
}

// Events

async function login({ username, password }) {
    console.log(`Usuário ${username} com senha ${password} tentando logar`);

    // Verifica se o player está online 
    for (let socketId in this.game.playersOnline) {
        if (this.game.playersOnline[socketId].username == username) {
            return this.socket.emit('ERROR', { type: 'player', message: 'Esse usuário já está logado.' });
        }    
    }

    const player = createUser(this.socket);

    const isValid = await player.login(username, password);

    if (isValid) {
        this.game.playersOnline[this.socket.id] = player;

        return this.socket.emit('INFO', { status: true, message: 'Login realizado com sucesso.' });
    }

    return this.socket.emit('ERROR', { type: 'player', message: 'Username ou senha incorretos.' });
}

async function signup({username, password}) {
    console.log(`Usuário ${username} com senha ${password} tentando cadastrar`);

    // Verifica se o player está online 
    for (let socketId in this.game.playersOnline) {
        if (this.game.playersOnline[socketId].username == username) {
            return this.socket.emit('ERROR', { type: 'player', message: 'Esse usuário já existe e está logado.' });
        }    
    }

    const player = createUser(this.socket);

    const isValid = await player.signUp(username, password);

    if (isValid) {
        this.game.playersOnline[this.socket.id] = player;

        console.log(this.game.playersOnline);

        return this.socket.emit('INFO', { status: true, message: 'Cadastro realizado com sucesso.' });
    }

    return this.socket.emit('ERROR', { type: 'player', message: 'Esse usuário já existe.' });
}

function disconnect() {
    console.log(`Player '${this.socket.id}' disconnected`);
    
    delete this.game.playersOnline[this.socket.id]
    delete this.game.playersSearching[this.socket.id]

    console.log(this.game.matches);
}

module.exports = User;