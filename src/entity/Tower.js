const { v4: uuidv4 } = require('uuid');
const Effects = require('../constants/Effects');
const Colors = require('../constants/TerminalColors');

function createTower(towerType = null) {

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
        towerType: towerType || {
            price: 300,
            range: 900,
            rate: 3,
            color: [255, 255, 255],
            bullet: {
                size: 5,
                speed: 10,
                damage: 1,
                duration: 10,
            }
        },
        effects: {},

        enemyIsInRange: function(enemy) {
            const distX  = this.position.x - enemy.position.current.x;
            const distY  = this.position.y - enemy.position.current.y;
            const distTotal  = Math.sqrt( Math.pow(distX, 2) + Math.pow(distY, 2));
            
            return distTotal > this.towerType.range;
        },

        targetIsInRange: function() {
            const distX  = this.position.x - this.target.position.current.x;
            const distY  = this.position.y - this.target.position.current.y;
            const distTotal  = Math.sqrt( Math.pow(distX, 2) + Math.pow(distY, 2));

            return distTotal < this.towerType.range;
        },

        setTarget: function(enemy) {
            this.target = enemy;
        },

        findTarget: function(enemies) {
            const index = enemies.findIndex(enemy => {
                const distance = Math.sqrt( Math.pow((this.position.x - enemy.position.current.x), 2) + Math.pow((this.position.y - enemy.position.current.y), 2));
                console.log(`\tTarget:\t${enemy.name},\tDistance: ${distance}`);
                return distance <= this.towerType.range;
            });

            if (index != -1) {
                this.target = enemies[index];
            }

            return this.target;
        },

        doDamage: function() {
            this.target.life.current -= this.towerType.bullet.damage;
        },

        applyEffect: function() {
            const effectName = this.towerType.effect;
            const effect = {...Effects[effectName]};

            if (!effect) {
                return console.log(`Effect '${effectName}' não existe`);
            }

            effect.apply(this.target);
        },

        getTarget: function() {
            return this.target;
        }
    }
}

module.exports = createTower 