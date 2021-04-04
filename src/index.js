import Game from "./game.js"

let game
let intervalId = null

function mouseDown(event) {
    game.createBullet(event)
    intervalId = setInterval(() => {
        game.createBullet(event)
    }, 100)
}

function mouseUp() {
    clearInterval(intervalId)
    intervalId = null
}

window.addEventListener("DOMContentLoaded", () => {
    game = new Game()
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
        case "ArrowLeft":
            game.moveLeft()
            break
        case "d":
        case "ArrowRight":
            game.moveRight()
            break
        case "w":
        case "ArrowUp":
            game.moveUp()
            break
        case "s":
        case "ArrowDown":
            game.moveDown()
            break
        case "1":
            game.changeWeapon("Weapon1")
            break
        case "2":
            game.changeWeapon("Weapon2")
            break
        case "3":
            game.changeWeapon("Weapon3")
            break
        default:
            break
    }
}, false)

window.addEventListener("keyup", (event) => {
    const key = event.key
    switch (key) {
        case "a":
        case "d":
        case "ArrowLeft":
        case "ArrowRight":
            game.stopLeftRight()
            break
        case "s":
        case "w":
        case "ArrowUp":
        case "ArrowDown":
            game.stopUpDown()
            break
        default:
            break
    }
}, false)