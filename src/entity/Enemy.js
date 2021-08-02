const { v4: uuidv4 } = require('uuid');

function createEnemy() {
    return {
        id: uuidv4(),
        speed: 2.5,     // Deve ser mutiplo dos caminhos
        path: [{x: 10, y: 10, angle: 1}, {x: 15, y: 15, angle: 1}, {x: 20, y: 15, angle: 1.5}, {x: 20, y: 10, angle: 1.5}, {x: 30, y: 30, angle: 1.5}],
        currentPath: {x: 10, y: 10, angle: 1},
        currentPathIndex: 0,
        position: {
            x: 5,
            y: 5,
            angle: 1,
        },
        life: {
            current: 100,
            total: 100
        },

        isDead: function() {
            return this.life.current <= 0;
        },

        reset: function() {
            this.life.current = 100;
            this.life.total = 100;

            this.position.x = 5;
            this.position.y = 5;
            this.position.angle = 1;
        },

        getNextPath: function() {
            this.currentPathIndex += 1;

            if (this.currentPathIndex >= this.path.length) {
                this.reset();
                
                this.currentPathIndex = 0;
            }

            return this.path[this.currentPathIndex];
        },

        getcurrentPathIndex: function() {
            return this.path[this.currentPathIndex];
        },

        moveToNextPathUsingSpeed: function() {
            let directionX = Math.sign(this.currentPath.x - this.position.x);
            let directionY = Math.sign(this.currentPath.y - this.position.y);
            
            if (directionX == 0 && directionY == 0) {
                console.log(`Going to next path`);

                this.currentPath = this.getNextPath();

                directionX = Math.sign(this.currentPath.x - this.position.x);
                directionY = Math.sign(this.currentPath.y - this.position.y);
            }

            this.position.x += directionX * this.speed;
            this.position.y += directionY * this.speed;
            this.position.angle = this.currentPath.angle;
        },

        moveToNextPath: function() {
            if (this.path.length >= this.currentPathIndex) {
                this.reset();
                
                this.currentPathIndex = 0;
            }

            this.position.x = this.path[this.currentPathIndex].x;
            this.position.y = this.path[this.currentPathIndex].y;
            this.position.angle = this.path[this.currentPathIndex].angle;

            this.currentPathIndex += 1;
        },
    }
}

module.exports = createEnemy