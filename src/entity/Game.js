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
        tickRate: 500,               // Tempo em ms de cada tick
        playersOnline: {},            // socketId => player
        playersSearching: {},         // socketId => player
        playerMap: {},                // playerId => socket
        matches: {},                  // Todas as partidas que estão em execução no momento. matchId => match
        inMatch: {},                  // Mapeamento dos dois sockets dos players para o id da partida. socketId => matchId
        towerTypes: {},               // towerTypeId => towerType (objeto)

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

        getSetup: function() {
            return {
                tower_types: this.towerTypes,
            };
        },

        startMatch: function(firstPlayer, secondPlayer) {
            const match = createMatch(firstPlayer, secondPlayer);
        
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

        start: async function() {
            Colors.printColored('FgMagenta', 'Starting game');
            Colors.printColored('FgMagenta', 'Loading towerTypes...');

            const towerTypes = await TowerTypeModel.find().exec()

            towerTypes.forEach(towerType => {
                Colors.printColored('FgMagenta', `Loaded ${towerType.name}.\tDamage: ${towerType.bullet.damage}.\tEffect: ${towerType.effect}`);
                this.towerTypes[towerType.id] = towerType
            });

            var that = this
            setInterval(function() {
                that.update();
            }, that.tickRate);
        },

        update: function() {
            // console.log(`Runing a game tick`);

            for (let matchId in this.matches) {
                this.runMatchTurn(this.matches[matchId])

                this.io.to(matchId).emit('MATCH_STATE', this.matches[matchId].state);
            }
            
            // Reset tick  
            this.tick = this.tick >= 1000 ? 0 : this.tick + 1;
        },

        runMatchTurn: function(match) {
            console.log(`Ticking match '${match.id}' tick ${this.tick}`);

            if (match.startTick > 0) {
                console.log(`Iniciando partida '${match.id}' em ${match.startTick} ticks`);
                match.startTick--;
                return;
            }

            const firstPlayer = match.state.first_player;
            const secondPlayer = match.state.second_player;

            this.runMatchPlayerTurn(match, firstPlayer);
            this.runMatchPlayerTurn(match, secondPlayer);
        },

        runMatchPlayerTurn: function(match, player) {

            // Tower 

            for (let i=0; i<player.towers.list.length; i++) {
                const tower = player.towers.list[i];

                Colors.printColored('FgGreen', `\nTicking '${player.username}' tower`);

                Colors.printColored('FgGreen', `\n   Tower:\t`);
                console.log(`\tFire Rate:\t${tower.type.rate}`);
                console.log(`\tPosition:\t${tower.position.x}, ${tower.position.y}`);
                console.log(`\tDamage:\t${tower.type.bullet.damage}`);
                if (tower.target) {
                    Colors.printColored('FgGreen', `\tTarget:\t${tower.target.name}`);
                } else {
                    console.log(`\tTarget:\t${tower.target ? tower.target.name : null}`);
                }

                if (this.tick % tower.type.rate == 0) {
                    if (!tower.target || tower.targetIsInRange() == false) {
                        Colors.printColored(`FgRed`, `\t\tSearching target...`);
                        tower.findTarget(player.enemies.list);
                    }

                    if (tower.target) {

                        this.io.to(match.id).emit('TOWER_SHOT', {
                            tower: {
                                id: tower.id,
                                target: {
                                    id: tower.target.id,
                                    name: tower.target.name,
                                    life: {
                                        current: tower.target.life.current,
                                        total: tower.target.life.total
                                    } 
                                }
                            },
                        })

                        tower.doDamage();
                        tower.applyEffect();
    
                        if (tower.target.isDead()) {
                            Colors.printColored('FgRed', `\nTarget '${tower.target.name}' died`);
                            tower.target.reset();
                            tower.target = null;
                        }
                    } 
                }
            }

            // Enemy 

            for (let j=0; j<player.enemies.list.length; j++) {
                const enemy = player.enemies.list[j];

                Colors.printColored('FgCyan', `\nTicking '${player.username}' enemy '${enemy.name}'`);

                enemy.tickEffects();
                enemy.moveToNextPathUsingSpeed();

                if (enemy.arrivedFinal) {
                    enemy.arrivedFinal = false;

                    match.removePlayerLife(player.id)

                    this.io.to(match.id).emit('PLAYER_LOST_LIFE', {
                        player: {
                            id: player.id,
                            username: player.username,
                            life: player.life
                        }
                    })

                    if (match.playerDied(player.id)) {
                        this.io.to(match.id).emit('PLAYER_DIED', {
                            player: {
                                id: player.id,
                                username: player.username,
                                life: player.life
                            }
                        })

                        this.finishMatch(match.id)
                    }
                }
            }
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