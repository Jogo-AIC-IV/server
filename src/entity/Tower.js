function createTower() {

    // Range da posição
    // x: 0px - 800px
    // y: 0px - 800px
    // angle: 0 - 2pi

    return {
        id: Math.floor(Math.random() * 1000),
        level: 1,
        price: 300,
        color: [255, 255, 255],
        range: 900,
        position: {
            x: 50,
            y: 50,
            angle: 2,
        },
        bullets: {
            buffer_cur: 0,
            buffer_max: 50,
            size: 10,
            speed: 20,
            damage: 1
        }
    }
}

module.exports = createTower 