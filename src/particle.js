export default class Particle {

    constructor(context, x, y, radius, color, velocity) {
        this.context = context
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.friction = 0.99
        this.alpha = 1
    }

    draw() {
        this.context.save()
        this.context.globalAlpha = this.alpha
        this.context.beginPath()
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        this.context.fillStyle = this.color
        this.context.fill()
        this.context.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= this.friction
        this.velocity.y *= this.friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha = this.alpha - 0.01
    }
}