export default class Player {

    constructor(context, x, y, radius, color) {
        this.context = context
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = {
            x: 0,
            y: 0
        }
        this.life = 0

    }

    draw() {
        this.context.beginPath()
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        this.context.fillStyle = this.color
        this.context.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}