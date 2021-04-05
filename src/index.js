import Game from "./game.js"

let game = null
let intervalId = 0
let x = 0
let y = 0

function mouseDown() {
    game.createBullet(x, y)
    intervalId = setInterval(() => {
        game.createBullet(x, y)
    }, 100)
}

function mouseUp() {
    clearInterval(intervalId)
    intervalId = null
}

window.addEventListener("DOMContentLoaded", () => {
    game = new Game()
    game.canvas.focus()
}, false)

window.addEventListener('resize', () => {
    if (game) {
        game.canvas.width = innerWidth
        game.canvas.height = innerHeight
    }
}, false)

window.addEventListener("contextmenu", event => {
    event.preventDefault()
    if (game.rocketCount > 0) {
        game.createRocket(x, y)
    } else {
        game.playAccessDeniedSound()
    }
}, false)

window.addEventListener("mousemove", event => {
    x = event.clientX
    y = event.clientY
}, false)

window.addEventListener("mousedown", (event) => {
    mouseDown(event)
}, false)

window.addEventListener("mouseup", (event) => {
    mouseUp()
}, false)

window.addEventListener("keydown", (event) => {
    const key = event.key
    switch (key) {
        case "Enter":
            game.start()
            break
        case "Escape":
            game.pause()
            break
        case "a":
        case "A":
        case "ArrowLeft":
            game.moveLeft()
            break
        case "d":
        case "D":
        case "ArrowRight":
            game.moveRight()
            break
        case "w":
        case "W":
        case "ArrowUp":
            game.moveUp()
            break
        case "s":
        case "S":
        case "ArrowDown":
            game.moveDown()
            break
        case " ":
            if (game.grenadeCount > 0) {
                game.createGrenade(x, y)
            } else {
                game.playAccessDeniedSound()
            }
            break
        default:
            break
    }
}, false)

window.addEventListener("keyup", (event) => {
    const key = event.key
    switch (key) {
        case "a":
        case "A":
        case "d":
        case "D":
        case "ArrowLeft":
        case "ArrowRight":
            game.stopLeftRight()
            break
        case "s":
        case "S":
        case "w":
        case "W":
        case "ArrowUp":
        case "ArrowDown":
            game.stopUpDown()
            break
        default:
            break
    }
}, false)