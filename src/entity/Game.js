const createMatch = require('./Match')

const debug = false;

function createGame(mainSocket) {

    return {
        io: mainSocket,
        playersOnline: {},
        playersSearching: {},
        matches: {},      // Todas as partidas que estão em execução no momento
        inMatch: {},      // Mapeamento dos dois sockets dos players para o id da partida

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

        startMatch: function(firstPlayer, secondPlayer) {
            const match = createMatch({...firstPlayer}, {...secondPlayer});
        
            this.inMatch[firstPlayer.socket.id] = match.id;
            this.inMatch[secondPlayer.socket.id] = match.id;

            this.matches[match.id] = match;
            
            return match;
        },

        start: function() {
            this.update();
        },

        update: function() {
            for (let matchId in this.matches) {
                this.matches[matchId].runTurn();
                
                
            }

            this.update();
        },

        // Helpers

        playerIsInMatch(socketId) {
            return this.inMatch[socketId];
        }
    }
}

module.exports = createGame 