const { v4: uuidv4 } = require('uuid');
const Colors = require('../constants/TerminalColors');

function createMatch(io, firstPlayer, secondPlayer, tick = 0) {

    const match = {
        id: uuidv4(),
        io: io,
        startTick: 0,
        wave: 1,
        state: {
            first_player: createMatchPlayer(firstPlayer),
            second_player: createMatchPlayer(secondPlayer),
        },

        runTurn: function(gameTick) {
            console.log(`Ticking match '${this.id}' tick ${gameTick}`);

            if (this.startTick > 0) {
                console.log(`Iniciando partida '${this.id}' em ${this.startTick} ticks`);
                this.startTick--;
                return;
            }

            const firstPlayer = this.state.first_player;
            const secondPlayer = this.state.second_player;

            this.runPlayerTurn(firstPlayer, gameTick);
            this.runPlayerTurn(secondPlayer, gameTick);
        },

        runPlayerTurn: function(player, gameTick) {
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

                if (gameTick % tower.type.rate == 0) {
                    if (!tower.target || tower.targetIsInRange() == false) {
                        Colors.printColored(`FgRed`, `\t\tSearching target...`);
                        tower.findTarget(player.enemies.list);
                    }

                    if (tower.target) {

                        this.io.to(this.id).emit('TOWER_SHOT', {
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

            for (let j=0; j<player.enemies.list.length; j++) {
                const enemy = player.enemies.list[j];

                Colors.printColored('FgCyan', `\nTicking '${player.username}' enemy '${enemy.name}'`);

                enemy.tickEffects();
                enemy.moveToNextPathUsingSpeed();
            }
        },

        addEnemy: function(playerId, enemy) {
            const player = this.getPlayerById(playerId);

            player.enemies.list.push(enemy);
            player.enemies.count++;
        },

        removeEnemy: function(playerId, enemyId) {
            const player = this.getPlayerById(playerId);
            const enemies = player.enemies;

            for (let i=0; i<enemies.list.length; i++) {
                if (enemies.list[i].id == enemyId) {
                    enemies.list = enemies.list.splice(i, 1);
                    enemies.count--;

                    break;
                }
            }
        },

        addTower: function(playerId, tower) {
            const player = this.getPlayerById(playerId);

            player.towers.list.push(tower);
        },

        removePlayerLife: function(playerId) {
            const player = this.getPlayerById(playerId);

            player.life -= 1;
        },

        getRandomTowerType: function(player) {
            const totalTowerTypes = player.selectedTowerTypes.length;
            
            // Index é um valor de 0 até totalTowerTypes
            const index = Math.floor(Math.random() * totalTowerTypes);

            return player.selectedTowerTypes[index];
        },

        getPlayerById(playerId) {
            return match.state.first_player.id == playerId ? match.state.first_player : match.state.second_player;
        },  
    }

    return match;
}

function createMatchPlayer(player) {
    return {
        id: player._id,
        username: player.username,
        name: player.name,
        unlockedTowerTypes: player.unlockedTowerTypes,
        selectedTowerTypes: player.selectedTowerTypes,
        life: 3,
        price: 100,
        money: 350,
        totalTier: 0,
        base: {
            position: {
                x: 100,
                y: 50
            }
        },
        enemies: {
            count: 0,
            list: []
        },
        towers: {
            types: [],
            list: [],
        }
    }
}

module.exports = createMatch 