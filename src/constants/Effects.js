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
    }
}

module.exports = Effects