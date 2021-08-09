const createMatch = require('./Match')
const TowerTypeModel = require('../models/TowerType');
const createEnemy = require('./Enemy');
const Effects = require('../constants/Effects');
const Colors = require('../constants/TerminalColors');

const debug = false;

function createGame(mainSocket) {

    return {
        io: mainSocket,
        tick: 0,
        tickRate: 1000,               // Tempo em ms de cada tick
        playersOnline: {},            // socketId => player
        playersSearching: {},         // socketId => player
        playerMap: {},                // playerId => socket
        matches: {},                  // Todas as partidas que estão em execução no momento. matchId => match
        inMatch: {},                  // Mapeamento dos dois sockets dos players para o id da partida. socketId => matchId

        getRandomPlayerSearching: function(blacklistId = null) {
            if (debug) {
                console.log('\n\n');
                for (let socketId in this.playersSearching) {
                    console.log(`Player online: ${socketId}`);
                }
                console.log('\n');
                for (let socketId in this.playersSearching) {
                    console.log(`Player searching: ${socketId}`);
                }
                console.log('\n\n');
            }

            // Pega a lista de ids dos sockets que estão procurando partida
            const socketIds = Object.keys(this.playersSearching);
            const totalPlayersSearching = socketIds.length - 1;
        
            if (!totalPlayersSearching) {
                return null;
            }
        
            // Index é um valor de 0 até totalPlayersSearching
            let index = Math.floor(Math.random() * (totalPlayersSearching + 1));
            let socketId = socketIds[index];

            // Se pegou ele mesmo, refaz
            while (blacklistId && blacklistId == socketId) {
                index = Math.floor(Math.random() * (totalPlayersSearching + 1));
                socketId = socketIds[index];
            }

            return this.playersOnline[socketId];
        },

        getSetup: async function() {
            const towerTypes = await TowerTypeModel.find().exec()

            return {
                tower_types: towerTypes,
            };
        },

        startMatch: function(firstPlayer, secondPlayer) {
            const match = createMatch(this.io, firstPlayer, secondPlayer);
        
            const firstPlayerSocketId = this.playerMap[firstPlayer._id].id;
            const secondPlayerSocketId = this.playerMap[secondPlayer._id].id;

            this.inMatch[firstPlayerSocketId] = match.id;
            this.inMatch[secondPlayerSocketId] = match.id;

            console.log("\nIn match:");
            console.log(this.inMatch)
            console.log('\n');

            this.matches[match.id] = match;

            const npcEnemy = createEnemy();

            console.log(`\tCreating enemy ${npcEnemy.name}`);

            match.addEnemy(firstPlayer._id, npcEnemy);

            return match;
        },

        searchMatch: function(socketId) {
            const player = this.getPlayerBySocketId(socketId);
            const playerSocket = this.getSocketByPlayerId(player._id);

            if (this.playerIsInMatch(socketId)) {
                return playerSocket.emit('ERROR', { type: "match", message: "O jogador já está em uma partida." });
            }

            this.playersSearching[socketId] = player;

            const enemy = this.getRandomPlayerSearching(socketId);
        
            if (!enemy) {
                console.log(`Search '${socketId}' not found enemy`);
                return playerSocket.emit('ERROR', { type: 'search', message: 'Nenhum jogador encontrado.' });
            }

            const enemySocket = this.getSocketByPlayerId(enemy._id);

            console.log(`'${playerSocket.id}' Found enemy '${enemySocket.id}'`);

            const match = this.startMatch(player, enemy);
            this.matches[match.id] = match;
        
            playerSocket.join(match.id);
            enemySocket.join(match.id);

            const setup = {
                first_player: player,
                second_player: enemy
            }
        
            this.io.to(match.id).emit('FOUND_MATCH', setup)
        
            delete this.playersSearching[playerSocket.id];
            delete this.playersSearching[playerSocket.id];
        },

        finishMatch: function(matchId) {
            console.log(`Game finishing match`);

            const match = this.matches[matchId];
            const firstPlayerId = match.state.first_player.id;
            const secondPlayerId = match.state.second_player.id;

            const firstPlayerSocket = this.getSocketByPlayerId(firstPlayerId);
            const secondsPlayerSocket = this.getSocketByPlayerId(secondPlayerId);

            this.io.to(matchId).emit('FINISH_MATCH', { quit: true });

            firstPlayerSocket.leave(matchId);
            secondsPlayerSocket.leave(matchId);

            delete this.inMatch[firstPlayerSocket.id];
            delete this.inMatch[secondsPlayerSocket.id];
            delete this.matches[matchId];
        },

        start: function() {
            Colors.printColored('FgMagenta', 'Starting game');

            var that = this
            setInterval(function() {
                that.update();
            }, that.tickRate);
        },

        update: function() {
            // console.log(`Runing a game tick`);

            for (let matchId in this.matches) {
                this.matches[matchId].runTurn(this.tick);

                this.io.to(matchId).emit('MATCH_STATE', this.matches[matchId].state);
            }
            
            // Reset tick  
            this.tick = this.tick >= 1000 ? 0 : this.tick + 1;
        },

        // Helpers

        playerIsInMatch: function(socketId) {
            return this.inMatch[socketId];
        },

        getPlayerBySocketId: function(socketId) {
            return this.playersOnline[socketId];
        },

        getSocketByPlayerId: function(playerId) {
            return this.playerMap[playerId];
        },

        getPlayerInMatchById(matchId, playerId) {
            const match = this.matches[matchId];

            if (!match) 
                return null;

            const player = match.state.first_player.id == playerId ? match.state.first_player : match.state.second_player;
            
            return player;
        },

        getPlayerInMatchBySocketId(matchId, socketId) {
            const match = this.matches[matchId];
            const player = this.getPlayerBySocketId(socketId);
            const matchPlayer = match.state.first_player.id == player._id ? match.state.first_player : match.state.second_player;

            return matchPlayer;
        }
    }
}

module.exports = createGame 