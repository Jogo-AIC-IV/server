const Colors = require("../constants/TerminalColors");
const UserService = require('../service/UserService')();

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
    Colors.printColored('FgGreen', `Usuário '${username}' com senha '${password}' tentando logar`);

    // Verifica se o player está online 
    for (let socketId in this.game.usersOnline) {
        if (this.game.usersOnline[socketId].username == username) {
            return this.socket.emit('ERROR', { type: 'player', message: 'Esse usuário já está logado.' });
        }    
    }

    const user = await UserService.login(username, password);

    if (!user) {
        return this.socket.emit('ERROR', { type: 'player', message: 'Usuário ou senha inválidos.' });
    }

    this.game.playerMap[user._id] = this.socket;
    this.game.usersOnline[this.socket.id] = user;

    return this.socket.emit('PLAYER_LOGIN', { status: true, message: user });
}

async function signup(data) {
    Colors.printColored('FgGreen', `Usuário '${data.username}' com senha '${data.password}' tentando cadastrar`);

    // Verifica se o player está online 
    for (let socketId in this.game.usersOnline) {
        if (this.game.usersOnline[socketId].username == data.username) {
            return this.socket.emit('ERROR', { type: 'player', message: 'Esse usuário já existe e está logado.' });
        }    
    }

    const user = await UserService.signup(data);

    if (!user) {
        return this.socket.emit('ERROR', { type: 'player', message: 'Esse usuário já existe.' });
    }

    return this.socket.emit('INFO', { status: true, message: 'Cadastro realizado com sucesso.' });
}

function disconnect() {
    Colors.printColored('FgRed', `Socket '${this.socket.id}' disconnected`);

    const user = this.game.getUserBySocketId(this.socket.id);
    const matchId = this.game.inMatch[this.socket.id];

    if (user) {
        Colors.printColored('FgRed', `Disconnecting player '${user.username}'`);
        delete this.game.playerMap[user.id];
    }

    if (matchId) {
        Colors.printColored('FgRed', `Finishing match '${matchId}'`);
        this.game.finishMatch(matchId);
    }
    
    delete this.game.usersOnline[this.socket.id];
    delete this.game.usersSearching[this.socket.id];

    console.log(this.game.matches);
}

module.exports = User;