const createMatch = require('./Match')
const { TowerType } = require('../models/TowerType');
const Tower = require('../events/Tower');
const createEnemy = require('./Enemy');

const debug = false;

function createGame(mainSocket) {

    return {
        io: mainSocket,
        tick: 0,
        tickRate: 2000,               // Tempo em ms de cada tick
        playersOnline: {},            // socketId => player
        playersSearching: {},         // socketId => player
        matches: {},                  // Todas as partidas que estão em execução no momento. matchId => match
        inMatch: {},                  // Mapeamento dos dois sockets dos players para o id da partida. socketId => matchId
        intervalId: null,

        getRandomPlayerSearching: function(blacklistId = null, indexBlacklist = null) {
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
            const towerTypes = await TowerType.find().exec()
        
            return {
                tower_types: towerTypes,
            };
        },

        startMatch: function(firstPlayer, secondPlayer) {
            const match = createMatch({...firstPlayer}, {...secondPlayer});
        
            this.inMatch[firstPlayer.socket.id] = match.id;
            this.inMatch[secondPlayer.socket.id] = match.id;

            this.matches[match.id] = match;

            match.state.first_player.enemies.list.push(createEnemy());
            
            return match;
        },

        searchMatch: function(socketId) {
            const player = this.playersOnline[socketId];
            
            if (this.playerIsInMatch(socketId)) {
                return player.socket.emit('ERROR', { type: "match", message: "O jogador já está em uma partida." });
            }

            this.playersSearching[socketId] = player;

            const enemy = this.getRandomPlayerSearching(socketId);
        
            if (!enemy) {
                console.log(`Search '${socketId}' not found enemy`);
                return player.socket.emit('ERROR', { type: 'search', message: 'Nenhum jogador encontrado.' });
            }

            console.log(`'${player.id}' Found enemy '${enemy.id}'`);

            const match = this.startMatch({...player}, {...enemy});
            const NPCEnemy = createEnemy();

            match.addEnemy(socketId, NPCEnemy);
        
            this.matches[match.id] = match;
        
            player.socket.join(match.id);
            enemy.socket.join(match.id);
        
            this.io.to(match.id).emit('SETUP_MATCH', match.state)
        
            delete this.playersSearching[player.socket.id];
            delete this.playersSearching[enemy.socket.id];
        },

        finishMatch: function(matchId) {
            console.log(`Game finishing match`);

            const match = this.matches[matchId];
            const firstPlayerId = match.state.first_player.id;
            const secondPlayerId = match.state.second_player.id;
            const firstPlayer = this.playersOnline[firstPlayerId];
            const secondPlayer = this.playersOnline[secondPlayerId];

            console.log(`Removing '${firstPlayer.username}' from match ${matchId}`);
            console.log(`Removing '${secondPlayer.username}' from match ${matchId}`);

            this.io.to(matchId).emit('FINISH_MATCH', { quit: true });

            firstPlayer.socket.leave(matchId);
            secondPlayer.socket.leave(matchId);

            delete this.inMatch[firstPlayerId];
            delete this.inMatch[secondPlayerId];
            delete this.matches[matchId];
        },

        start: function() {
            console.log(`Starting game`);

            var that = this
            this.intervalId = setInterval(() => {
                that.update();
            }, that.tickRate);
        },

        update: function() {
            console.log(`Runing a game tick`);

            for (let matchId in this.matches) {
                this.matches[matchId].runTurn(this.tick);

                this.io.to(matchId).emit('MATCH_STATE', this.matches[matchId].state);
            }
            
            // Reset tick  
            this.tick = this.tick >= 1000 ? 0 : this.tick + 1;
        },

        // Helpers

        playerIsInMatch(socketId) {
            return this.inMatch[socketId];
        }
    }
}

module.exports = createGame 