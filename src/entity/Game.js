const createMatch = require('./Match')
const Effects = require('../constants/Effects');
const Colors = require('../constants/TerminalColors');
const TowerTypeService = require('../service/TowerTypeService')();

const debug = false;

function createGame(mainSocket) {

    return {
        io: mainSocket,
        tick: 0,
        tickRate: 500,              // Tempo em ms de cada tick
        usersOnline: {},            // socketId => user
        usersSearching: {},         // socketId => user
        playerMap: {},              // userId => socket
        matches: {},                // Todas as partidas que estão em execução no momento. matchId => match
        inMatch: {},                // Mapeamento dos dois sockets dos players para o id da partida. socketId => matchId
        towerTypes: {},             // towerTypeId => towerType (objeto)

        getRandomUserSearching: function(blacklistId = null) {
            if (debug) {
                console.log('\n\n');
                for (let socketId in this.usersSearching) {
                    console.log(`User online: ${socketId}`);
                }
                console.log('\n');
                for (let socketId in this.usersSearching) {
                    console.log(`User searching: ${socketId}`);
                }
                console.log('\n\n');
            }

            // Pega a lista de ids dos sockets que estão procurando partida
            const socketIds = Object.keys(this.usersSearching);
            const totalUsersSearching = socketIds.length - 1;
        
            if (!totalUsersSearching) {
                return null;
            }
        
            // Index é um valor de 0 até totalUsersSearching
            let index = Math.floor(Math.random() * (totalUsersSearching + 1));
            let socketId = socketIds[index];

            // Se pegou ele mesmo, refaz
            while (blacklistId && blacklistId == socketId) {
                index = Math.floor(Math.random() * (totalUsersSearching + 1));
                socketId = socketIds[index];
            }

            return this.usersOnline[socketId];
        },

        getSetup: function() {
            return {
                effects: Object.keys(Effects),
                tower_types: this.towerTypes,
            };
        },

        startMatch: function(firstUser, secondUser) {
            const match = createMatch(firstUser, secondUser);
        
            const firstUserSocketId = this.playerMap[firstUser._id].id;
            const secondUserSocketId = this.playerMap[secondUser._id].id;

            this.inMatch[firstUserSocketId] = match.id;
            this.inMatch[secondUserSocketId] = match.id;

            console.log("\nIn match:");
            console.log(this.inMatch)
            console.log('\n');

            this.matches[match.id] = match;
            
            return match;
        },

        searchMatch: function(socketId) {
            const user = this.getUserBySocketId(socketId);
            const userSocket = this.getSocketByUserId(user._id);

            if (this.playerIsInMatch(socketId)) {
                return userSocket.emit('ERROR', { type: "match", message: "O jogador já está em uma partida." });
            }

            this.usersSearching[socketId] = user;

            const enemyUser = this.getRandomUserSearching(socketId);
        
            if (!enemyUser) {
                console.log(`Search '${socketId}' not found enemy`);
                return userSocket.emit('ERROR', { type: 'search', message: 'Nenhum jogador encontrado.' });
            }

            const enemyUserSocket = this.getSocketByUserId(enemyUser._id);

            console.log(`'${userSocket.id}' Found enemy '${enemyUserSocket.id}'`);

            const match = this.startMatch(user, enemyUser);
            this.matches[match.id] = match;
        
            userSocket.join(match.id);
            enemyUserSocket.join(match.id);

            const players = {
                first_player: match.state.first_player,
                second_player: match.state.second_player
            }
        
            delete this.usersSearching[userSocket.id];
            delete this.usersSearching[userSocket.id];

            this.emitToMatch(match.id, 'FOUND_MATCH', { players })
        },

        finishMatch: function(matchId) {
            console.log(`Game finishing match`);

            const match = this.matches[matchId];
            const firstUserId = match.state.first_player.id;
            const secondUserId = match.state.second_player.id;

            const firstUserSocket = this.getSocketByUserId(firstUserId);
            const secondUserSocket = this.getSocketByUserId(secondUserId);

            this.emitToMatch(matchId, 'FINISH_MATCH', { quit: true });

            firstUserSocket.leave(matchId);
            secondUserSocket.leave(matchId);

            delete this.inMatch[firstUserSocket.id];
            delete this.inMatch[secondUserSocket.id];
            delete this.matches[matchId];
        },

        start: async function() {
            Colors.printColored('FgMagenta', 'Starting game');
            Colors.printColored('FgMagenta', 'Loading towerTypes...');

            const towerTypes = await TowerTypeService.getAll();

            if (towerTypes) {
                towerTypes.forEach(towerType => {
                    Colors.printColored('FgMagenta', `Loaded ${towerType.name}.\tDamage: ${towerType.bullet.damage}.\tEffect: ${towerType.effect}`);
                    this.towerTypes[towerType.id] = towerType
                });
            }

            var that = this
            setInterval(function() {
                that.update();
            }, that.tickRate);
        },

        update: function() {
            // console.log(`Runing a game tick`);

            for (let matchId in this.matches) {
                this.runMatchTurn(this.matches[matchId])

                this.emitToMatch(matchId, 'MATCH_STATE', this.matches[matchId].state);
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
                    if (!tower.target || !tower.targetIsInRange()) {
                        Colors.printColored(`FgRed`, `\t\tSearching target...`);
                        tower.findTarget(player.enemies.list);
                    }

                    if (tower.target) {

                        this.emitToMatch(match.id, 'TOWER_SHOT', {
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

                            player.increaseMoney(tower.target.money);

                            this.emitToMatch(match.id, 'ENEMY_DIED', {
                                player: {
                                    id: player.id,
                                    username: player.username,
                                    money: player.money
                                },
                                enemy: tower.target
                            });

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

                    player.removeLife();

                    this.emitToMatch(match.id, 'PLAYER_LOST_LIFE', {
                        player: {
                            id: player.id,
                            username: player.username,
                            life: player.life
                        }
                    });

                    if (player.isDead()) {
                        this.emitToMatch(match.id, 'PLAYER_DIED', {
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

        emitToMatch(matchId, eventName, data) {
            this.io.to(matchId).emit(eventName, data);
        },

        playerIsInMatch: function(socketId) {
            return this.inMatch[socketId];
        },

        getUserBySocketId: function(socketId) {
            return this.usersOnline[socketId];
        },

        getSocketByUserId: function(userId) {
            return this.playerMap[userId];
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
            const player = this.getUserBySocketId(socketId);
            const matchPlayer = match.state.first_player.id == player._id ? match.state.first_player : match.state.second_player;

            return matchPlayer;
        }
    }
}

module.exports = createGame 