require('dotenv').config()

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*", } });

const MatchEvents = require('./events/Match');
const UserEvents = require('./events/User');

const createGame = require('./entity/Game');
const createPlayer = require('./entity/Player');

// Variável principal que contém todas as informações do jogo
const Game = createGame(io);

io.on('connection', socket => {
    console.log(`Socket '${socket.id}' connected`)

    // Cria um player com um nome aleatório
    Game.playersOnline[socket.id] = createPlayer(socket, (Math.random() + 1).toString(36).substring(5));

    // Todas categorias dos eventos 
    const eventHandlers = {
        match: new MatchEvents(Game, socket),
        user:  new UserEvents(Game, socket),
    };

    // Linka o socket aos eventos
    for (let category in eventHandlers) {
        let handler = eventHandlers[category].handler;
        for (let event in handler) {
            socket.on(event, handler[event]);
        }
    }
});

server.listen(3000, () => {
    console.log(`listening on localhost:3000`);
});