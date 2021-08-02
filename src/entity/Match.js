const { v4: uuidv4 } = require('uuid');

function createMatch(firstPlayer, secondPlayer, tick = 0) {

    const match = {
        id: uuidv4(),
        state: {
            first_player: createMatchPlayer(firstPlayer),
            second_player: createMatchPlayer(secondPlayer),
        },

        runTurn: function(gameTick) {
            console.log(`Ticking match '${this.id}' tick ${gameTick}`);

            const firstPlayer = this.state.first_player;
            const secondPlayer = this.state.second_player;

            this.runPlayerTurn(firstPlayer, gameTick);
            this.runPlayerTurn(secondPlayer, gameTick);
        },

        runPlayerTurn: function(player, gameTick) {
            // console.log(`Running player '${player.id}' tick`);

            for (let i=0; i<player.towers.list.length; i++) {
                const tower = player.towers.list[i];

                console.log(`Tower:\n\trate:\t${tower.towerType.rate}\n\tTower damange:\t${tower.towerType.bullet.damage}`);

                if (gameTick % tower.towerType.rate == 0) {
                    const enemy = tower.findTarget(player.enemies.list);

                    if (enemy) {
                        console.log(`Enemy: ${enemy.id}`);

                        tower.doDamage();
    
                        if (enemy.isDead())
                            enemy.reset();
                    } 
                }
            }

            for (let j=0; j<player.enemies.list.length; j++) {
                const enemy = player.enemies.list[j];

                enemy.moveToNextPathUsingSpeed();

                console.log(`Enemy:\n\tEnemyId:\t${enemy.id}\n\tCurrent Path:\t${enemy.currentPathIndex}\n\tPosition:\tX:${enemy.position.x} Y:${enemy.position.y}\n`);
            }
        },

        addEnemy: function(socketId, enemy) {
            const playerKey = this.state.first_player.id == socketId ? 'first_player' : 'second_player';

            this.state[playerKey].enemies.count++;
            this.state[playerKey].enemies.first++;
            this.state[playerKey].enemies.list.push(enemy);
        },

        removeEnemy: function(socketId, enemyId) {
            const playerKey = this.state.first_player.id == socketId ? 'first_player' : 'second_player';
            const enemies = this.state[playerKey].enemies;

            for (let i=0; i<enemies.list.length; i++) {
                if (enemies.list[i].id == enemyId) {
                    enemies.list = enemies.list.splice(i, 1);
                    enemies.count--;

                    break;
                }
            }
        },

        addTower: function(socketId, tower) {
            const playerKey = this.state.first_player.id == socketId ? 'first_player' : 'second_player';

            this.state[playerKey].towers.list.push(tower);
        }
    }

    return match;
}

function createMatchPlayer(player) {
    return {
        id: player.id,
        username: player.username,
        name: player.name,
        life: 3,
        price: 100,
        money: 350,
        total_tier: 0,
        enemies: {
            count: 0,
            first: 0,
            list: []
        },
        towers: {
            types: [],
            list: [],
        }
    }
}

module.exports = createMatch 