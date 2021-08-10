const Effects = {
    slow: {
        totalTicks: 5,
        speedSlow: 2,

        apply: function(target) {
            target.effects['slow'] = this;
            target.speed.current = target.speed.base - this.speedSlow;
            console.log(`\tSlowing down from ${target.speed.base} to ${target.speed.current}`);
        },

        remove: function(target) {
            console.log(`\tRecovering from ${target.speed.current} to ${target.speed.base}`);

            target.speed.current = target.speed.base;

            delete target.effects['slow'];
        },

        tick: function(target) {
            console.log(`\tSlow tick '${this.totalTicks}'`);
            this.totalTicks--;
        } 
    },

    burn: {
        totalTicks: 5,
        damage: 2,

        apply: function(target) {
            target.effects['burn'] = this;
            console.log(`\tBurning enemy ${target.name}`);
        },

        remove: function(target) {
            console.log(`\tRemoving burn from ${target.name}`);

            delete target.effects['burn'];
        },

        tick: function(target) {
            console.log(`\tBurn tick '${this.totalTicks}'`);
            this.totalTicks--;

            target.life.current -= this.damage
        } 
    }
}

module.exports = Effects