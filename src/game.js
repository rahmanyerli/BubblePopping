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

// game levels enum
const GameLevels = {
    LEVEL_1: { ENEMY_CREATION_SPEED: 2000, ENEMY_SPEED: 1 },
    LEVEL_2: { ENEMY_CREATION_SPEED: 1500, ENEMY_SPEED: 1.5 },
    LEVEL_3: { ENEMY_CREATION_SPEED: 1250, ENEMY_SPEED: 2 },
    LEVEL_4: { ENEMY_CREATION_SPEED: 1000, ENEMY_SPEED: 2.25 },
    LEVEL_5: { ENEMY_CREATION_SPEED: 750, ENEMY_SPEED: 2.5 },
}
Object.freeze(GameLevels)

// weapon levels enum
const WeaponLevels = {
    LEVEL_1: 1,
    LEVEL_2: 2,
    LEVEL_3: 3,
    LEVEL_4: 4,
    LEVEL_5: 5
}
Object.freeze(WeaponLevels)

// fire types enum
const FireTypes = {
    BULLET: 1,
    ROCKET: 2,
    GRENADE: 3
}
Object.freeze(FireTypes)

// sounds enum
const Sounds = {
    WEAPPON_LEVEL_1: { SOUND: "weapon1.wav", DURATION: 300 },
    WEAPPON_LEVEL_2: { SOUND: "weapon2.wav", DURATION: 300 },
    WEAPPON_LEVEL_3: { SOUND: "weapon3.wav", DURATION: 300 },
    WEAPPON_LEVEL_4: { SOUND: "weapon3.wav", DURATION: 300 },
    WEAPPON_LEVEL_5: { SOUND: "weapon3.wav", DURATION: 300 },
    HEALTH: { SOUND: "health.wav", DURATION: 500 },
    WEAPPON_CHANGE: { SOUND: "weapon_change.wav", DURATION: 2000 },
    SHRINK: { SOUND: "shrink.wav", DURATION: 300 },
    DESTROY: { SOUND: "destroy.wav", DURATION: 500 },
    ACCESS_DENIED: { SOUND: "access_denied.wav", DURATION: 300 },
    GAME_OVER: { SOUND: "game_over.wav", DURATION: 2000 }
}
Object.freeze(Sounds)

export default class Game {

    constructor() {
        this.canvas = document.querySelector("canvas")
        this.avoidCanvasSelection()
        this.canvas.width = innerWidth
        this.canvas.height = innerHeight
        this.context = this.canvas.getContext("2d")
        this.animationId = 0
        this.gameState = GameStates.PAUSED
        this.gameLevel
        this.currentScore = 0
        this.player = this.createPlayer()
        this.bullets = []
        this.enemies = []
        this.particles = []
        this.enemyRadiuses = [16, 32, 48, 64, 80, 96]
        this.enemyColors = ["#FFCC44", "#FF8844", "#FF5544", "#CC3399", "#9933FF", "#6666FF"]
        this.weaponLevel = WeaponLevels.LEVEL_1
        this.weaponSound = Sounds.WEAPPON_LEVEL_1
        this.bulletRadius = 2
        this.bulletPower = 1
        this.interval = 0
        this.highestScore = document.getElementById("highest_score")
        this.score = document.getElementById("score")
        this.menu = document.getElementById("menu_wrapper")
        this.status = document.getElementById("status")
        this.badges = document.getElementById("badges")
        this.badgeCount = 1
        this.healthCount = 0
        this.healthScore = 0
        this.healths = document.getElementById("healths")
        this.rocketCount = 0
        this.rocketScore = 0
        this.rockets = document.getElementById("rockets")
        this.grenadeCount = 0
        this.grenadeScore = 0
        this.grenades = document.getElementById("grenades")
        this.getScore()
        this.handleGameLevel()
    }

    avoidCanvasSelection() {
        this.canvas.addEventListener("selectstart", () => {
            return false;
        }, false)
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

    createBullet(targetX, targetY) {
        if (this.gameState !== GameStates.STARTED) {
            return
        }
        this.handleWeapon()
        const x = this.player.x
        const y = this.player.y
        const radius = this.bulletRadius
        const power = this.bulletPower
        const color = "#FFFFFF"
        const angle = Math.atan2(targetY - y, targetX - x)
        let deviation = 0
        let velocity = {
            x: Math.cos(angle + deviation) * 12,
            y: Math.sin(angle + deviation) * 12
        }
        const fireType = FireTypes.BULLET
        this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity, fireType))
        this.playFireSound()
    }

    createRocket(targetX, targetY) {
        if (this.gameState !== GameStates.STARTED ||  this.rocketCount == 0) {
            return
        }
        this.handleWeapon()
        const x = this.player.x
        const y = this.player.y
        const radius = this.bulletRadius * 3
        const power = this.bulletPower * 24
        const color = "#88CC44"
        const angle = Math.atan2(targetY - y, targetX - x)
        let velocity = {
            x: Math.cos(angle) * 12,
            y: Math.sin(angle) * 12
        }
        const fireType = FireTypes.ROCKET
        this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity, fireType))
        this.playFireSound()
        this.playWeaponChangedSound()
        this.rocketCount -= 1
        this.rocketScore = 0
        this.rockets.removeChild(this.rockets.childNodes[0])
    }

    createGrenade(targetX, targetY) {
        if (this.gameState !== GameStates.STARTED ||  this.grenadeCount == 0) {
            return
        }
        this.handleWeapon()
        const x = this.player.x
        const y = this.player.y
        const radius = this.bulletRadius * 2
        const power = this.bulletPower * 12
        const color = "#00BBCC"
        let velocity = {}
        const fireType = FireTypes.GRENADE
        velocity = {
            x: Math.cos(0) * 12,
            y: Math.sin(0) * 12
        }
        this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity, fireType))
        velocity = {
            x: Math.cos(30) * 12,
            y: Math.sin(30) * 12
        }
        this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity, fireType))
        velocity = {
            x: Math.cos(60) * 12,
            y: Math.sin(60) * 12
        }
        this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity, fireType))
        velocity = {
            x: Math.cos(90) * 12,
            y: Math.sin(90) * 12
        }
        this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity, fireType))
        velocity = {
            x: Math.cos(120) * 12,
            y: Math.sin(120) * 12
        }
        this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity, fireType))
        velocity = {
            x: Math.cos(150) * 12,
            y: Math.sin(150) * 12
        }
        this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity, fireType))
        velocity = {
            x: Math.cos(180) * 12,
            y: Math.sin(180) * 12
        }
        this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity, fireType))
        velocity = {
            x: Math.cos(210) * 12,
            y: Math.sin(210) * 12
        }
        this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity, fireType))
        velocity = {
            x: Math.cos(240) * 12,
            y: Math.sin(240) * 12
        }
        this.bullets.push(new Bullet(this.context, x, y, radius, power, color, velocity, fireType))
        this.playFireSound()
        this.playWeaponChangedSound()
        this.grenadeCount -= 1
        this.grenadeScore = 0
        this.grenades.removeChild(this.grenades.childNodes[0])
    }

    createEnemy() {
        let x
        let y
        const randomIndex = Math.floor(Math.random() * this.enemyRadiuses.length)
        let radius = this.enemyRadiuses[randomIndex]
        let color = this.enemyColors[randomIndex]
        let armour = 0

        if (this.gameLevel === GameLevels.LEVEL_5) {
            const random = Math.floor(Math.random() * 32)
            if (random === 13) {
                radius = 96
                color = "#999999"
                armour = 5
            }
        } else if (this.gameLevel === GameLevels.LEVEL_4) {
            const random = Math.floor(Math.random() * 16)
            if (random === 13) {
                radius = 64
                color = "#666666"
                armour = 4
            }
        }

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : this.canvas.width + radius
            y = Math.random() * this.canvas.height
        } else {
            x = Math.random() * this.canvas.width
            y = Math.random() < 0.5 ? 0 - radius : this.canvas.height + radius
        }

        const angle = Math.atan2(this.player.y - y, this.player.x - x)
        const velocity = {
            x: Math.cos(angle) * this.gameLevel.ENEMY_SPEED,
            y: Math.sin(angle) * this.gameLevel.ENEMY_SPEED
        }
        const enemy = new Enemy(this.context, x, y, radius, color, velocity, armour)
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
        }, this.gameLevel.ENEMY_CREATION_SPEED)
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
                this.shrinkOrDestroy(bullet, bulletIndex, enemy, enemyIndex)
            }
        })
    }

    shrinkOrDestroy(bullet, bulletIndex, enemy, enemyIndex) {
        if (enemy.radius > 24) {
            this.shrinkEnemy(bullet, bulletIndex, enemy)
        } else {
            this.destroyEnemy(bullet, bulletIndex, enemy, enemyIndex)
        }
    }

    shrinkEnemy(bullet, bulletIndex, enemy) {
        setTimeout(() => {
            // destroy bullet or grenades
            if (bullet.fireType === FireTypes.BULLET || bullet.fireType === FireTypes.GRENADE) {
                this.bullets.splice(bulletIndex, 1)
            }
            // shrink the enemy
            enemy.radius -= bullet.power - enemy.armour
        }, 0)
        this.playShrinkSound()
    }

    destroyEnemy(bullet, bulletIndex, enemy, enemyIndex) {
        this.handleDestroyScore(enemy)
        this.playDestroySound()
        setTimeout(() => {
            // destroy bullet or grenade
            if (bullet.fireType === FireTypes.BULLET || bullet.fireType === FireTypes.GRENADE) {
                this.bullets.splice(bulletIndex, 1)
            }
            // destroy the enemy
            this.enemies.splice(enemyIndex, 1)
        }, 0)
    }

    handleDestroyScore(enemy) {
        const score = Math.floor(Math.pow(enemy.defaultRadius / 8, 3))
        this.currentScore += score
        this.healthScore += Math.floor(enemy.defaultRadius / 8)
        this.rocketScore += score
        this.grenadeScore += score
        this.score.innerText = this.currentScore
        this.handleGameLevel()
        this.handleWeapon()
        this.handleHealths()
        this.handleRockets()
        this.handleGrenades()
    }

    addBadge() {
        const badge = document.createElement("span")
        badge.classList.add("badge")
        this.badges.appendChild(badge)
        this.playHealthSound()
    }

    handleHealths() {
        if (this.healthCount === 10) {
            this.healthScore = 0
        } else if (this.healthScore > 16) {
            // add health
            this.healthScore = 0
            this.healthCount += 1
            const health = document.createElement("span")
            health.classList.add("health")
            this.healths.appendChild(health)
            this.playHealthSound()
        }
    }

    handleRockets() {
        if (this.rocketCount === 10) {
            this.rocketScore = 0
        } else if (this.rocketScore > 512) {
            // add rocket
            this.rocketScore = 0
            this.rocketCount += 1
            const rocket = document.createElement("span")
            rocket.classList.add("rocket")
            this.rockets.appendChild(rocket)
            this.playWeaponChangedSound()
        }
    }

    handleGrenades() {
        if (this.grenadeCount === 10) {
            this.grenadeScore = 0
        } else if (this.grenadeScore > 1024) {
            // add grenade
            this.grenadeScore = 0
            this.grenadeCount += 1
            const grenade = document.createElement("span")
            grenade.classList.add("grenade")
            this.grenades.appendChild(grenade)
            this.playWeaponChangedSound()
        }
    }

    handleGameLevel() {
        if (this.currentScore > 10000000) {
            if (this.gameLevel === GameLevels.LEVEL_5) {
                return
            }
            this.gameLevel = GameLevels.LEVEL_5
            this.refresh()
            this.addBadge()
        } else if (this.currentScore > 1000000) {
            if (this.gameLevel === GameLevels.LEVEL_4) {
                return
            }
            this.gameLevel = GameLevels.LEVEL_4
            this.refresh()
            this.addBadge()
        } else if (this.currentScore > 100000) {
            if (this.gameLevel === GameLevels.LEVEL_3) {
                return
            }
            this.gameLevel = GameLevels.LEVEL_3
            this.refresh()
            this.addBadge()
        } else if (this.currentScore > 10000) {
            if (this.gameLevel === GameLevels.LEVEL_2) {
                return
            }
            this.gameLevel = GameLevels.LEVEL_2
            this.refresh()
            this.addBadge()
        } else {
            if (this.gameLevel === GameLevels.LEVEL_1) {
                return
            }
            this.addBadge()
            this.gameLevel = GameLevels.LEVEL_1
        }
    }

    handleWeapon() {
        switch (this.gameLevel) {
            case GameLevels.LEVEL_5:
                if (this.weaponLevel === WeaponLevels.LEVEL_5) {
                    return
                }
                this.player.radius = 56
                this.weaponLevel = WeaponLevels.LEVEL_5
                this.weaponSound = Sounds.WEAPPON_LEVEL_5
                this.bulletPower = 5
                this.bulletRadius = 10
                this.playWeaponChangedSound()
                break;
            case GameLevels.LEVEL_4:
                if (this.weaponLevel === WeaponLevels.LEVEL_4) {
                    return
                }
                this.player.radius = 48
                this.weaponLevel = WeaponLevels.LEVEL_4
                this.weaponSound = Sounds.WEAPPON_LEVEL_4
                this.bulletPower = 4
                this.bulletRadius = 8
                this.playWeaponChangedSound()
                break;
            case GameLevels.LEVEL_3:
                if (this.weaponLevel === WeaponLevels.LEVEL_3) {
                    return
                }
                this.player.radius = 40
                this.weaponLevel = WeaponLevels.LEVEL_3
                this.weaponSound = Sounds.WEAPPON_LEVEL_3
                this.bulletPower = 3
                this.bulletRadius = 6
                this.playWeaponChangedSound()
                break;
            case GameLevels.LEVEL_2:
                if (this.weaponLevel === WeaponLevels.LEVEL_2) {
                    return
                }
                this.player.radius = 32
                this.weaponLevel = WeaponLevels.LEVEL_2
                this.weaponSound = Sounds.WEAPPON_LEVEL_2
                this.bulletPower = 2
                this.bulletRadius = 4
                this.playWeaponChangedSound()
                break;
            default:
                if (this.weaponLevel === WeaponLevels.LEVEL_1) {
                    return
                }
                this.player.radius = 24
                this.weaponLevel = WeaponLevels.LEVEL_1
                this.weaponSound = Sounds.WEAPPON_LEVEL_1
                this.bulletPower = 1
                this.bulletRadius = 2
                this.playWeaponChangedSound()
                break;
        }
    }

    handleCollision(enemy, index) {
        const enemyDistance = Math.hypot((this.player.x - enemy.x), (this.player.y - enemy.y))
        const isCollision = enemyDistance - enemy.radius - this.player.radius < 0
        if (isCollision) {
            const healthCount = Math.floor(enemy.radius / 16)
            if (this.healthCount < healthCount) {
                this.healthCount = 0
            } else {
                this.healthCount -= healthCount
                this.healthScore = 0
            }
            if (this.healthCount <= 0) {
                this.handleGameOver()
                return
            } else {
                setTimeout(() => {
                    // destroy the enemy
                    this.enemies.splice(index, 1)
                    this.createParticles(enemy, enemy)
                    this.playDestroySound()
                }, 0)
            }
            for (let index = 0; index < healthCount; index++) {
                this.healths.removeChild(this.healths.childNodes[0])
            }
        }
    }

    handleGameOver() {
        this.player.health = 0
        cancelAnimationFrame(this.animationId)
        this.status.innerText = "Game Over"
        this.menu.classList.add("visible")
        this.gameState = GameStates.GAME_OVER
        this.playGameOverSound()
        this.saveScore()
        setTimeout(() => {
            // refresh page
            location.reload()
        }, 2000)
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

    refresh() {
        cancelAnimationFrame(this.animationId)
        clearInterval(this.interval)
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.animate()
        this.createEnemies()
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

    playHealthSound() {
        const sound = new Sound(Sounds.HEALTH.SOUND, Sounds.HEALTH.DURATION)
        sound.play()
        sound.stop()
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

    playAccessDeniedSound() {
        const sound = new Sound(Sounds.ACCESS_DENIED.SOUND, Sounds.ACCESS_DENIED.DURATION)
        sound.play()
        sound.stop()
    }
}