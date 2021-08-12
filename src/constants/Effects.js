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
    },

    bleed: {
        totalTicks: 5,
        damage: 3,

        apply: function(target) {
            target.effects['bleed'] = this;
            console.log(`\tBleeding enemy ${target.name}`);
        },

        remove: function(target) {
            console.log(`\tRemoving bleed from ${target.name}`);

            delete target.effects['bleed'];
        },

        tick: function(target) {
            console.log(`\tBleed tick '${this.totalTicks}'`);
            this.totalTicks--;

            target.life.current -= this.damage
        } 
    },

    poison: {
        totalTicks: 10,
        damage: 1,

        apply: function(target) {
            target.effects['poison'] = this;
            console.log(`\tPoisoning enemy ${target.name}`);
        },

        remove: function(target) {
            console.log(`\tRemoving poison from ${target.name}`);

            delete target.effects['poison'];
        },

        tick: function(target) {
            console.log(`\tPoison tick '${this.totalTicks}'`);
            this.totalTicks--;

            target.life.current -= this.damage
        } 
    },

    heal: {
        totalTicks: 1,
        heal: 1,

        apply: function(target) {
            target.effects['heal'] = this;
            console.log(`\tHealing ${target.name}`);
        },

        remove: function(target) {
            console.log(`\tRemoving heal from ${target.name}`);

            delete target.effects['heal'];
        },

        tick: function(target) {
            console.log(`\tHeal tick '${this.totalTicks}'`);
            this.totalTicks--;

            target.life.current += this.heal
        } 
    },

    freeze: {
        totalTicks: 5,

        apply: function(target) {
            target.effects['freeze'] = this;
            target.speed.current = 0;

            console.log(`\tFreezing enemy ${target.name}`);
        },

        remove: function(target) {
            console.log(`\tRemoving freeze from ${target.name}`);

            target.speed.current = target.speed.base;

            delete target.effects['freeze'];
        },

        tick: function(target) {
            this.totalTicks--;
        } 
    }
}

module.exports = Effects