const { v4: uuidv4 } = require('uuid');
const Effects = require('../constants/Effects');
const Colors = require('../constants/TerminalColors');

function createTower(towerType = null, x = null, y = null) {
    return {
        id: uuidv4(),
        tier: 1,
        target: null,
        position: {
            x: x || 50,
            y: y || 50,
            angle: 2,
        },
        type: towerType,
        effects: {},

        enemyIsInRange: function(enemy) {
            const distX  = this.position.x - enemy.position.current.x;
            const distY  = this.position.y - enemy.position.current.y;
            const distTotal  = Math.sqrt( Math.pow(distX, 2) + Math.pow(distY, 2));
            
            return distTotal > this.type.range;
        },

        targetIsInRange: function() {
            const distX  = this.position.x - this.target.position.current.x;
            const distY  = this.position.y - this.target.position.current.y;
            const distTotal  = Math.sqrt( Math.pow(distX, 2) + Math.pow(distY, 2));

            return distTotal < this.type.range;
        },

        setTarget: function(enemy) {
            this.target = enemy;
        },

        findTarget: function(enemies) {
            const index = enemies.findIndex(enemy => {
                const distance = Math.sqrt( Math.pow((this.position.x - enemy.position.current.x), 2) + Math.pow((this.position.y - enemy.position.current.y), 2));
                console.log(`\tTarget:\t${enemy.name},\tDistance: ${distance}`);
                return distance <= this.type.range;
            });

            if (index != -1) {
                this.target = enemies[index];
            }

            return this.target;
        },

        doDamage: function() {
            this.target.life.current -= this.type.bullet.damage;
        },

        applyEffect: function() {
            const effectName = this.type.effect;
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