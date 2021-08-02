const { v4: uuidv4 } = require('uuid');

function createTower(typeId = null) {

    // Range da posição
    // x: 0px - 800px
    // y: 0px - 800px
    // angle: 0 - 2pi

    return {
        id: uuidv4(),
        tier: 1,
        target: null,
        position: {
            x: 50,
            y: 50,
            angle: 2,
        },
        towerType: {
            price: 300,
            range: 900,
            rate: 50,
            color: [255, 255, 255],
            bullet: {
                size: 5,
                speed: 10,
                damage: 1,
                duration: 10,
            }
        },

        enemyIsInRange: function(enemy) {
            const distX  = this.position.x - enemy.position.x;
            const distY  = this.position.y - enemy.position.y;
            const distTotal  = Math.sqrt( Math.pow(distX, 2) + Math.pow(distY, 2));
            
            return distTotal > this.towerType.range;
        },

        findTarget: function(enemies) {
            const index = enemies.findIndex(enemy => {
                let distance = Math.sqrt( Math.pow((this.position.x - enemy.position.x), 2) + Math.pow((this.position.y - enemy.position.y), 2));
                return distance <= TouchList.towerType.range;
            });

            if (index != -1) {
                this.target = enemies[index];
            }

            return this.target;
        },

        doDamage: function() {
            if (this.target)
                this.target.life.current -= this.towerType.bullet.damage;
        },

        getTarget: function() {
            return this.target;
        }
    }
}

module.exports = createTower 