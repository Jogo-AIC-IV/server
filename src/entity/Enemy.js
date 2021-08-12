const { v4: uuidv4 } = require('uuid');
const Colors = require('../constants/TerminalColors');

function createEnemy(name = null) {
    const enemy = {
        id: uuidv4(),
        name: name || 'Default',
        level: 1,
        money: 20,
        arrivedFinal: false,
        position: {
            start: null,
            current: null,
            target: null,
            final: null,
        },
        effects: {},
        speed: {
            current: 5,
            base: 5
        },
        life: {
            current: 100,
            total: 100
        },
        path: [
            {x: 10, y: 10, angle: 1}, 
            {x: 100, y: 10, angle: 1}, 
            {x: 100, y: 50, angle: 1.5}, 
            {x: 200, y: 50, angle: 1.5}, 
            {x: 200, y: 150, angle: 1.5},
            {x: 150, y: 150, angle: 1.5},
        ],

        initialize: function() {
            this.position = {
                start: { ...this.path[0] },
                current: { ...this.path[0] },
                target: { ...this.path[1], index: 0 },
                final: { ...this.path[this.path.length - 1] },
            };
        },

        isDead: function() {
            return this.life.current <= 0;
        },

        reset: function() {
            this.life.current = 100;
            this.life.total = 100;

            this.position.current = {...this.position.start};
        },

        tickEffects: function() {
            for (let effectName in this.effects) {
                const effect = this.effects[effectName];

                effect.tick(this);

                if (effect.totalTicks <= 0) {
                    effect.remove(this);
                }
            }
        },

        updateTargetPath: function() {
            this.position.target.index += 1;

            if (this.position.target.index >= this.path.length) {
                this.arrivedFinal = true;

                this.reset();
                
                this.position.target.index = 0;
            }

            const tempPath = this.getCurrentPathIndex();

            this.position.target.x = tempPath.x;
            this.position.target.y = tempPath.y;
            this.position.target.angle = tempPath.angle;
        },

        getCurrentPathIndex: function() {
            return this.path[this.position.target.index];
        },

        moveToNextPathUsingSpeed: function() {
            console.log(this.position)
            let directionX = Math.sign(this.position.target.x - this.position.current.x);
            let directionY = Math.sign(this.position.target.y - this.position.current.y);

            Colors.printColored('FgCyan', `\n   Path:\t`);
            console.log(`\tTarget Path:\t${this.position.target.x}, ${this.position.target.y}`);
            console.log(`\tPosition:\t${this.position.current.x}, ${this.position.current.y}`);
            console.log(`\tDirection:\t${directionX}, ${directionY}`);
            console.log(`\tMove Speed:\t${this.speed.current}`);
            console.log(`\tLifes: \t${this.life.current}/${this.life.total}`);

            if (directionX == 0 && directionY == 0) {
                this.updateTargetPath();

                directionX = Math.sign(this.position.target.x - this.position.current.x);
                directionY = Math.sign(this.position.target.y - this.position.current.y);
            }

            let distanceToTargetX = this.position.target.x - this.position.current.x;
            let distanceToTargetY = this.position.target.y - this.position.current.y;

            this.position.current.x += distanceToTargetX < this.speed.current ? distanceToTargetX : directionX * this.speed.current;
            this.position.current.y += distanceToTargetY < this.speed.current ? distanceToTargetY : directionY * this.speed.current;

            this.position.current.angle = this.position.target.angle;
        },

        moveToNextPath: function() {
            if (this.path.length >= this.position.target.index) {
                this.reset();
                
                this.position.target.index = 0;
            }

            this.position.current.x = this.path[this.position.target.index].x;
            this.position.current.y = this.path[this.position.target.index].y;
            this.position.current.angle = this.path[this.position.target.index].angle;

            this.position.target.index += 1;
        },
    }

    enemy.initialize();

    return enemy;
}

module.exports = createEnemy