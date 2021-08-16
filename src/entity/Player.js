function createPlayer(user) {
    return {
        id: user._id,
        name: user.name,
        username: user.username,
        unlockedTowerTypes: user.unlockedTowerTypes,
        selectedTowerTypes: user.selectedTowerTypes,
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
            types: user.selectedTowerTypes,
            list: [],
        },

        isDead: function() {
            return this.life.current <= 0;
        },

        increaseMoney(money) {
            this.money += money;
        },

        addEnemy: function(enemy) {
            this.enemies.list.push(enemy);
            this.enemies.count++;
        },

        removeEnemy: function(enemyId) {
            for (let i=0; i<this.enemies.list.length; i++) 
            {
                if (this.enemies.list[i].id == enemyId) {
                    this.enemies.list.splice(i, 1);
                    this.enemies.count--;

                    return true;
                }
            }

            return false;
        },

        addTower: function(tower) {
            this.towers.list.push(tower);
        },

        removeTower: function(towerId) {
            for (let i=0; i<this.towers.list.length; i++) 
            {
                if (this.towers.list[i].id == towerId) {
                    this.towers.list.splice(i, 1);

                    return true;
                }
            }

            return false;
        },

        removeLife: function(quantity = 1) {
            this.life.current -= quantity
        },

        getRandomTowerType: function() {
            const totalTowerTypes = this.towers.types.length;
            
            // Index é um valor de 0 até totalTowerTypes
            const index = Math.floor(Math.random() * totalTowerTypes);

            return this.towers.types[index];
        },

        getTowerType: function(tower) {
            const types = this.towers.types;

            for(let i=0; i<types.length; i++) {
                if (tower.type.id == types[i].id) {
                    return types[i];
                }
            }

            return null;
        },

        getTowerTypeById: function(towerTypeId) {
            const types = this.towers.types;

            for(let i=0; i<types.length; i++) {
                if (types[i].id == towerTypeId) {
                    return types[i];
                }
            }

            return null;
        }

    }
}

module.exports = createPlayer