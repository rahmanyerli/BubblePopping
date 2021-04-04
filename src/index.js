import Game from "./game.js"

let game
let intervalId = null
let x
let y

function mouseDown(event) {
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
}, false)

document.addEventListener('mousemove', event => {
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
            game.createBullet(x, y)
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