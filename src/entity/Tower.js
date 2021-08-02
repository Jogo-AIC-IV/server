const { v4: uuidv4 } = require('uuid');

function createTower(typeId = null) {

    // Range da posição
    // x: 0px - 800px
    // y: 0px - 800px
    // angle: 0 - 2pi

    return {
        id: uuidv4(),
        tier: 1,
        price: 300,
        color: [255, 255, 255],
        range: 900,
        position: {
            x: 50,
            y: 50,
            angle: 2,
        },
        type_id: typeId || 'xxx'
    }
}

module.exports = createTower 