export default class Enemy {

    constructor(context, x, y, radius, color, velocity) {
        this.context = context
        this.x = x
        this.y = y
        this.radius = radius
        this.defaultRadius = radius
        this.color = color
        this.velocity = velocity
        this.strength = radius / 8
    }

    draw() {
        this.context.beginPath()
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        this.context.fillStyle = this.color
        this.context.fill()
    }

    update() {
        this.draw()
        this.strength = this.radius / 8
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}