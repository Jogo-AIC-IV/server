require('dotenv').config()

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*", } });

const port = 3005;

const MatchEvents = require('./events/Match');
const UserEvents = require('./events/User');
const TowerEvents = require('./events/Tower');
const TowerTypeEvents = require('./events/TowerType');
const EnemyEvents = require('./events/Enemy');

const createGame = require('./entity/Game');

// Variável principal que contém todas as informações do jogo
const Game = createGame(io);

Game.start();

io.on('connection', async (socket) => {
    console.log(`Socket '${socket.id}' connected`)

    const setup = Game.getSetup();
    socket.emit('SETUP', { setup });

    // Todas categorias dos eventos 
    const eventHandlers = {
        match: new MatchEvents(Game, socket),
        user:  new UserEvents(Game, socket),
        tower: new TowerEvents(Game, socket),
        towerType: new TowerTypeEvents(Game, socket),
        enemy: new EnemyEvents(Game, socket),
    };

    // Linka o socket aos eventos
    for (let category in eventHandlers) {
        let handler = eventHandlers[category].handler;
        for (let event in handler) {
            socket.on(event, handler[event]);
        }
    }
});

server.listen(port, () => {
    console.log(`listening on localhost:${port}`);
});