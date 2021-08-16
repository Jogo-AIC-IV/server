const mongoose = require('../database');

const TowerTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'Mage',
        required: true
    },
    isDefault: {
        type: Boolean,
        default: false,
        required: true,
    },
    effect: {
        type: String,
        default: 'slow',
        required: true
    },
    price: {
        type: Number,
        default: 300,
        required: true
    },
    range: {
        type: Number,
        default: 900,
        required: true
    },
    rate: {
        type: Number,
        default: 50,
        required: true,
    },
    color: {
        type: [Number],
        default: [255, 255, 255],
        required: true
    },
    bullet: {
        type: Object,
        required: true,
        default: {
            size: 5,
            speed: 10,
            damage: 1,
            duration: 10,
        }
    }
});

// Transform _id to id and remove __v key
TowerTypeSchema.set('toJSON', { virtuals: true, versionKey: false, transform: function (doc, ret) { delete ret._id } });
TowerTypeSchema.set('toObject', { virtuals: true, versionKey: false, transform: function (doc, ret) { delete ret._id }  })

const TowerType = mongoose.model('TowerType', TowerTypeSchema);


module.exports = TowerType;