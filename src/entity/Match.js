const { v4: uuidv4 } = require('uuid');
const Colors = require('../constants/TerminalColors');

function createMatch(firstPlayer, secondPlayer) {

    const match = {
        id: uuidv4(),
        startTick: 0,
        wave: 1,
        state: {
            first_player: createMatchPlayer(firstPlayer),
            second_player: createMatchPlayer(secondPlayer),
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

            player.life.current -= 1;
        },

        playerDied: function(playerId) {
            const player = this.getPlayerById(playerId);

            return player.life.current <= 0;
        },

        getRandomTowerType: function(player) {
            const totalTowerTypes = player.towers.types.length;
            
            // Index é um valor de 0 até totalTowerTypes
            const index = Math.floor(Math.random() * totalTowerTypes);

            return player.towers.types[index];
        },

        getTowerType: function(tower, types) {
            for(let i=0; i<types.length; i++) {
                if (tower.type == types[i].id) {
                    return types[i];
                }
            }

            return null;
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
        price: 100,
        money: 350,
        totalTier: 0,
        life: {
            current: 3,
            total: 3
        },
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
            types: player.selectedTowerTypes,
            list: [],
        }
    }
}

module.exports = createMatch 