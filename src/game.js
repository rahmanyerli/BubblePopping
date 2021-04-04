import Player from "./player.js"
import Enemy from "./enemy.js"
import Bullet from "./bullet.js"
import Particle from "./particle.js"
import Sound from "./sound.js"

// game states enum
const GameStates = {
    STARTED: 1,
    PAUSED: 2,
    GAME_OVER: 3
}
Object.freeze(GameStates)

// weapon levels enum
const WeaponLevels = {
    LEVEL_1: 1,
    LEVEL_2: 2,
    LEVEL_3: 3,
    LEVEL_4: 4,
    LEVEL_5: 5
}
Object.freeze(WeaponLevels)

// sounds enum
const Sounds = {
    WEAPPON_LEVEL_1: { SOUND: "weapon1.wav", DURATION: 500 },
    WEAPPON_LEVEL_2: { SOUND: "weapon2.wav", DURATION: 500 },
    WEAPPON_LEVEL_3: { SOUND: "weapon3.wav", DURATION: 500 },
    WEAPPON_LEVEL_4: { SOUND: "weapon3.wav", DURATION: 500 },
    WEAPPON_LEVEL_5: { SOUND: "weapon3.wav", DURATION: 500 },
    WEAPPON_CHANGE: { SOUND: "weapon_change.wav", DURATION: 2000 },
    SHRINK: { SOUND: "shrink.wav", DURATION: 500 },
    DESTROY: { SOUND: "destroy2.wav", DURATION: 500 },
    GAME_OVER: { SOUND: "game_over.wav", DURATION: 2000 }
}
Object.freeze(Sounds)

export default class Game {

    constructor() {
        this.canvas = document.querySelector("canvas")
        this.canvas.width = innerWidth
        this.canvas.height = innerHeight
        this.context = this.canvas.getContext("2d")
        this.animationId = 0
        this.gameState = GameStates.PAUSED
        this.currentScore = 0
        this.player = this.createPlayer()
        this.bullets = []
        this.enemies = []
        this.particles = []
        this.enemyRadiuses = [16, 32, 48, 64, 80, 96]
        this.enemyColors = ["#FFCC33", "#FF7733", "#FF3333", "#CC3399", "#9933FF", "#6666FF"]
        this.weaponLevel = WeaponLevels.LEVEL_1
        this.weaponSound = Sounds.WEAPPON_LEVEL_1
        this.bulletRadius = 4
        this.firePower = 8
        this.interval = 0
        this.bonusAmmo = 0
        this.highestScore = document.getElementById("highest_score")
        this.score = document.getElementById("score")
        this.menu = document.getElementById("menu_wrapper")
        this.status = document.getElementById("status")
        this.life = document.getElementById("life")
        this.ammo = document.getElementById("ammo")
        this.getScore()
    }

    animate() {
        this.animationId = requestAnimationFrame(() => {
            this.animate()
        })
        this.context.fillStyle = "rgba(0, 0, 0, 0.1)"
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.player.update()
        this.handleBullets()
        this.handleEnemies()
        this.handleParticles()
    }

    getScore() {
        const bubblePoppingString = localStorage.getItem("bubble-popping")
        if (bubblePoppingString) {
            let bubblePopping = JSON.parse(bubblePoppingString)
            this.highestScore.innerText = bubblePopping.highestScore
            this.score.innerText = bubblePopping.score
        }
    }

    createPlayer() {
        const x = this.canvas.width / 2
        const y = this.canvas.height / 2
        const radius = 24
        const color = "#FFFFFF"
        return new Player(this.context, x, y, radius, color)
    }

    createBullet(event) {
        if (this.gameState !== GameStates.STARTED) {
            return
        }
        this.handleBonusAmmo()
        this.handleWeapon()
        const x = this.player.x
        const y = this.player.y
        const radius = this.bulletRadius
        const power = this.firePower
        const color = "#FFFFFF"
        const angle = Math.atan2(event.clientY - y, event.clientX - x)
        let deviation = 0
        let velocity = {
            x: Math.cos(angle + deviation) * 12,
            y: Math.sin(angle + deviation) * 12
        }
        switch (this.weaponLevel) {
            case WeaponLevels.LEVEL_5:
                // add first bullet
                this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity))
                    // add second bullet
                deviation = 0.1
                velocity = {
                    x: Math.cos(angle + deviation) * 12,
                    y: Math.sin(angle + deviation) * 12
                }
                this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity))
                    // add third bullet
                deviation = -0.1
                velocity = {
                    x: Math.cos(angle + deviation) * 12,
                    y: Math.sin(angle + deviation) * 12
                }
                this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity))
                this.playFireSound()
                break
            case WeaponLevels.LEVEL_4:
                // add first bullet
                this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity))
                this.playFireSound()
                setTimeout(() => {
                    this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity))
                    this.playFireSound()
                }, 200);
                break
            default:
                this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity))
                this.playFireSound()
                break
        }
    }

    createEnemy() {
        let x
        let y
        const randomIndex = Math.floor(Math.random() * this.enemyRadiuses.length)
        const radius = this.enemyRadiuses[randomIndex]
        const color = this.enemyColors[randomIndex]

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : this.canvas.width + radius
            y = Math.random() * this.canvas.height
        } else {
            x = Math.random() * this.canvas.width
            y = Math.random() < 0.5 ? 0 - radius : this.canvas.height + radius
        }

        const angle = Math.atan2(this.player.y - y, this.player.x - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        const enemy = new Enemy(this.context, x, y, radius, color, velocity)
        this.enemies.push(enemy)
    }

    createParticles(enemy, bullet) {
        const count = enemy.radius
        for (let index = 0; index < count; index++) {
            this.particles.push(this.createParticle(enemy, bullet))
        }
    }

    createParticle(enemy, bullet) {
        const x = bullet.x
        const y = bullet.y
        const radius = Math.random() * 4
        const color = enemy.color
        const velocity = {
            x: (Math.random() - 0.5) * (Math.random() * 8),
            y: (Math.random() - 0.5) * (Math.random() * 8)
        }
        return new Particle(this.context, x, y, radius, color, velocity)
    }

    createEnemies() {
        this.interval = setInterval(() => {
            this.createEnemy()
        }, 1500)
    }

    handleEnemies() {
        this.enemies.forEach((enemy, index) => {
            try {
                enemy.update()
                this.handleCollision(enemy, index)
                this.handleHits(enemy, index)
                const isOutOfEdges = enemy.x + enemy.radius < 0 ||
                    enemy.x - enemy.radius > this.canvas.width ||
                    enemy.y + enemy.radius < 0 ||
                    enemy.y - enemy.radius > this.canvas.height
                if (isOutOfEdges) {
                    // destroy the enemy
                    setTimeout(() => {
                        this.enemies.splice(index, 1)
                    }, 0)
                }
            } catch {
                // destroy the enemy
                setTimeout(() => {
                    this.enemies.splice(index, 1)
                }, 0)
            }
        })
    }

    handleHits(enemy, enemyIndex) {
        this.bullets.forEach((bullet, bulletIndex) => {
            const bulletDistance = Math.hypot((bullet.x - enemy.x), (bullet.y - enemy.y))
            const isHit = bulletDistance - enemy.radius - bullet.radius < 0
            if (isHit) {
                this.createParticles(enemy, bullet)
                this.shrinkOrDestroy(enemy, bullet, bulletIndex, enemyIndex)
            }
        })
    }

    shrinkOrDestroy(enemy, bullet, bulletIndex, enemyIndex) {
        if (enemy.radius > 24) {
            this.shrinkEnemy(bullet, bulletIndex, enemy)
        } else {
            this.destroyEnemy(enemy, bulletIndex, enemyIndex)
        }
    }

    shrinkEnemy(bullet, bulletIndex, enemy) {
        this.handleHitScore(bullet)
        setTimeout(() => {
            // destroy the bullet and shrink the enemy
            this.bullets.splice(bulletIndex, 1)
            if (bullet.power > enemy.strength) {
                enemy.radius = enemy.radius - bullet.power + enemy.strength
            }
        }, 0)
        this.playShrinkSound()
    }

    destroyEnemy(enemy, bulletIndex, enemyIndex) {
        this.handleDestroyScore(enemy)
        this.playDestroySound()
        setTimeout(() => {
            // destroy the bullet and the enemy
            this.bullets.splice(bulletIndex, 1)
            this.enemies.splice(enemyIndex, 1)
        }, 0)
    }

    handleHitScore(bullet) {
        this.currentScore += bullet.radius / 4
        this.score.innerText = this.currentScore
    }

    handleDestroyScore(enemy) {
        const score = Math.floor(Math.pow(enemy.defaultRadius / 8, 3))
        this.currentScore += score
        this.bonusAmmo += score
        this.player.life += Math.floor(enemy.defaultRadius / 8)
        this.life.innerText = this.player.life
        this.score.innerText = this.currentScore
        this.ammo.innerText = this.bonusAmmo
        this.handleWeapon()
    }

    handleBonusAmmo() {
        if (this.firePower > 8) {
            this.bonusAmmo -= this.firePower * (this.bulletRadius / 2 + 2)
            this.ammo.innerText = this.bonusAmmo
        }
    }

    handleWeapon() {
        if (this.bonusAmmo > 10000) {
            if (this.weaponLevel !== WeaponLevels.LEVEL_5) {
                this.player.radius = 40
                this.weaponLevel = WeaponLevels.LEVEL_5
                this.weaponSound = Sounds.WEAPPON_LEVEL_5
                this.firePower = 24
                this.bulletRadius = 12
                this.playWeaponChangedSound()
            }
        } else if (this.bonusAmmo > 5000) {
            if (this.weaponLevel !== WeaponLevels.LEVEL_4) {
                this.player.radius = 40
                this.weaponLevel = WeaponLevels.LEVEL_4
                this.weaponSound = Sounds.WEAPPON_LEVEL_4
                this.firePower = 24
                this.bulletRadius = 12
                this.playWeaponChangedSound()
            }
        } else if (this.bonusAmmo > 2000) {
            if (this.weaponLevel !== WeaponLevels.LEVEL_3) {
                this.player.radius = 40
                this.weaponLevel = WeaponLevels.LEVEL_3
                this.weaponSound = Sounds.WEAPPON_LEVEL_3
                this.firePower = 24
                this.bulletRadius = 12
                this.playWeaponChangedSound()
            }
        } else if (this.bonusAmmo > 1000) {
            if (this.weaponLevel !== WeaponLevels.LEVEL_2) {
                this.player.radius = 32
                this.weaponLevel = WeaponLevels.LEVEL_2
                this.weaponSound = Sounds.WEAPPON_LEVEL_2
                this.firePower = 16
                this.bulletRadius = 8
                this.playWeaponChangedSound()
            }
        } else {
            if (this.weaponLevel !== WeaponLevels.LEVEL_1) {
                this.player.radius = 24
                this.weaponLevel = WeaponLevels.LEVEL_1
                this.weaponSound = Sounds.WEAPPON_LEVEL_1
                this.firePower = 8
                this.bulletRadius = 4
                this.playWeaponChangedSound()
            }
        }
    }

    playWeaponChangedSound() {
        const sound = new Sound(Sounds.WEAPPON_CHANGE.SOUND, Sounds.WEAPPON_CHANGE.DURATION)
        sound.play()
        sound.stop()
    }

    playFireSound() {
        const sound = new Sound(this.weaponSound.SOUND, this.weaponSound.DURATION)
        sound.play()
        sound.stop()
    }

    playShrinkSound() {
        const sound = new Sound(Sounds.SHRINK.SOUND, Sounds.SHRINK.DURATION)
        sound.play()
        sound.stop()
    }

    playDestroySound() {
        const sound = new Sound(Sounds.DESTROY.SOUND, Sounds.DESTROY.DURATION)
        sound.play()
        sound.stop()
    }

    playGameOverSound() {
        const sound = new Sound(Sounds.GAME_OVER.SOUND, Sounds.GAME_OVER.DURATION)
        sound.play()
        sound.stop()
    }

    handleCollision(enemy, index) {
        const enemyDistance = Math.hypot((this.player.x - enemy.x), (this.player.y - enemy.y))
        const isCollision = enemyDistance - enemy.radius - this.player.radius < 0
        if (isCollision) {
            this.player.life -= Math.floor(enemy.radius)
            if (this.player.life <= 0) {
                this.handleGameOver()
            } else {
                setTimeout(() => {
                    // destroy the enemy
                    this.enemies.splice(index, 1)
                    this.createParticles(enemy, enemy)
                }, 0)
            }
            this.life.innerText = this.player.life
        }
    }

    handleGameOver() {
        this.player.life = 0
        cancelAnimationFrame(this.animationId)
        this.status.innerText = "Game Over"
        this.menu.classList.add("visible")
        this.gameState = GameStates.GAME_OVER
        this.playGameOverSound()
        this.saveScore()
        setTimeout(() => {
            // refresh page
            location.reload()
        }, 1500)
    }

    saveScore() {
        const bubblePoppingString = localStorage.getItem("bubble-popping")
        let bubblePopping = {}
        if (bubblePoppingString) {
            bubblePopping = JSON.parse(bubblePoppingString)
            if (bubblePopping) {
                if (bubblePopping.highestScore < this.currentScore) {
                    bubblePopping.highestScore = this.currentScore
                }
                bubblePopping.score = this.currentScore
            }
        } else {
            bubblePopping = { highestScore: this.currentScore, score: this.currentScore }
        }
        localStorage.setItem("bubble-popping", JSON.stringify(bubblePopping))
    }

    handleBullets() {
        this.bullets.forEach((bullet, index) => {
            bullet.update()
            const isOutOfEdges = bullet.x + bullet.radius < 0 ||
                bullet.x - bullet.radius > this.canvas.width ||
                bullet.y + bullet.radius < 0 ||
                bullet.y - bullet.radius > this.canvas.height
            if (isOutOfEdges) {
                // destroy the bullet
                setTimeout(() => {
                    this.bullets.splice(index, 1)
                }, 0)
            }
        })
    }

    handleParticles() {
        this.particles.forEach((particle, index) => {
            if (particle.alpha <= 0) {
                // destroy the particle
                this.particles.splice(index, 1)
            } else {
                particle.update()
            }
        })
    }

    start() {
        if (this.gameState == GameStates.STARTED) {
            return
        }
        this.gameState = GameStates.STARTED
        this.status.innerText = "New Game"
        this.menu.classList.remove("visible")
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.animate()
        this.createEnemies()
    }

    pause() {
        if (this.gameState == GameStates.PAUSED) {
            return
        } else {
            this.gameState = GameStates.PAUSED
            this.status.innerText = "Paused"
            this.menu.classList.add("visible")
            cancelAnimationFrame(this.animationId)
            clearInterval(this.interval)
            this.saveScore()
        }
    }

    moveLeft(event) {
        const isOutOfEdges = (this.player.x + this.player.radius) < 0
        if (isOutOfEdges) {
            this.player.x = this.canvas.width + this.player.radius
        } else {
            this.player.velocity.x = -4
        }
    }

    moveRight() {
        const isOutOfEdges = (this.player.x - this.player.radius) > this.canvas.width
        if (isOutOfEdges) {
            this.player.x = 0 - this.player.radius
        } else {
            this.player.velocity.x = 4
        }
    }

    moveUp() {
        const isOutOfEdges = (this.player.y + this.player.radius) < 0
        if (isOutOfEdges) {
            this.player.y = this.canvas.height + this.player.radius
        } else {
            this.player.velocity.y = -4
        }
    }

    moveDown() {
        const isOutOfEdges = (this.player.y - this.player.radius) > this.canvas.height
        if (isOutOfEdges) {
            this.player.y = 0 - this.player.radius
        } else {
            this.player.velocity.y = 4
        }
    }

    stopLeftRight() {
        this.player.velocity.x = 0
    }

    stopUpDown() {
        this.player.velocity.y = 0
    }
}