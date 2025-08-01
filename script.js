const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const backgroundImage = new Image()
backgroundImage.src = './img/bg.png'

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }

        this.rotation = 0

        const image = new Image()
        image.src = './img/playerc.png'
        image.onload = () => {
            const scale = 1.2
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }
    }

    draw() {
        c.save()
        c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2)
        c.rotate(this.rotation)
        c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2)

        if (this.image)
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)

        c.restore()
    }

    update() {
        if (this.image) {
            this.draw()
            this.position.x += this.velocity.x
        }
    }
}

class Projectile {
    constructor(position, velocity) {
        this.position = position
        this.velocity = velocity
        this.radius = 10

        const image = new Image()
        image.src = './img/tir.png'
        image.onload = () => {
            this.image = image
            this.width = image.width
            this.height = image.height
        }
    }

    draw() {
        if (this.image) {
            c.drawImage(
                this.image,
                this.position.x - this.width / 2,
                this.position.y - this.height / 2,
                this.width,
                this.height
            )
        }
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Particle {
    constructor(position, velocity, radius, color) {
        this.position = position
        this.velocity = velocity
        this.radius = radius
        this.color = color
        this.opacity = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        this.opacity -= 0.01
    }
}

class InvaderProjectile {
    constructor(position, velocity) {
        this.position = position
        this.velocity = velocity
        this.radius = 3

        const image = new Image()
        image.src = './img/tireen.png'
        image.onload = () => {
            this.image = image
            this.width = image.width
            this.height = image.height
        }
    }

    draw() {
        if (this.image) {
            c.drawImage(
                this.image,
                this.position.x - this.width / 2,
                this.position.y - this.height / 2,
                this.width,
                this.height
            )
        }
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Invader {
    constructor({ position }) {
        this.velocity = {
            x: 0,
            y: 0
        }

        const image = new Image()
        image.src = './img/enemyb.png'
        image.onload = () => {
            const scale = 1
            this.image = image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: position.x,
                y: position.y
            }
        }
    }

    draw() {
        if (this.image)
            c.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

    update({ velocity }) {
        if (this.image) {
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }

    shoot(invaderProjectiles) {
        invaderProjectiles.push(new InvaderProjectile(
            {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height
            },
            {
                x: 0,
                y: 5
            }
        ))
    }
}

class Grid {
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        this.velocity = {
            x: 3,
            y: 0
        }
        this.invaders = []

        const columns = Math.floor(Math.random() * 10 + 5)
        const rows = Math.floor(Math.random() * 2 + 1)

        this.width = columns * 40

        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                this.invaders.push(new Invader({
                    position: {
                        x: x * 40,
                        y: y * 40
                    }
                }))
            }
        }
    }

    update() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x + this.width >= canvas.width || this.position.x <= 0) {
            this.velocity.x = -this.velocity.x
            this.velocity.y = 40
        }
    }
}

const player = new Player()
const projectiles = []
const grids = []
const invaderProjectiles = []
const particles = []

const keys = {
    q: {
        pressed: false
    },
    d: {
        pressed: false
    },
    space: {
        pressed: false
    }
}

let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)

function createParticles(object, color) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(
            {
                x: object.position.x + (object.width ? object.width / 2 : 0),
                y: object.position.y + (object.height ? object.height / 2 : 0)
            },
            {
                x: (Math.random() - 0.5) * 2,
                y: (Math.random() - 0.5) * 2
            },
            Math.random() * 3,
            color || 'yellow'
        ))
    }
}

function animate() {
    requestAnimationFrame(animate)
    c.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height)
    player.update()

    particles.forEach((particle, i) => {
        if (particle.opacity <= 0) {
            setTimeout(() => {
                particles.splice(i, 1)
            }, 0)
        } else {
            particle.update()
        }
    })

    invaderProjectiles.forEach((invaderProjectile, index) => {
        if (invaderProjectile.position.y + (invaderProjectile.height || 0) >= canvas.height) {
            setTimeout(() => {
                invaderProjectiles.splice(index, 1)
            }, 0)
        } else {
            invaderProjectile.update()
        }

        // projectiles hit player
        if (
            player.position &&
            invaderProjectile.position.y + (invaderProjectile.height || 0) >= player.position.y &&
            invaderProjectile.position.x + (invaderProjectile.width || 0) >= player.position.x &&
            invaderProjectile.position.x <= player.position.x + player.width
        ) {
            createParticles(player, 'white')
        }
    })

    projectiles.forEach((projectile, index) => {
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        } else {
            projectile.update()
        }
    })

    grids.forEach((grid, gridIndex) => {
        grid.update()

        // spawn projectile ennemi
        if (frames % 100 === 0 && grid.invaders.length > 0) {
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
        }

        grid.invaders.forEach((invader, invaderIndex) => {
            invader.update({ velocity: grid.velocity })

            // Projectiles hit ennemies
            projectiles.forEach((projectile, projectileIndex) => {
                if (
                    projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                    projectile.position.x + projectile.radius >= invader.position.x &&
                    projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                    projectile.position.y + projectile.radius >= invader.position.y
                ) {
                    setTimeout(() => {
                        const invaderFound = grid.invaders.find(inv => inv === invader)
                        const projectileFound = projectiles.find(proj => proj === projectile)

                        // remove invader and projectiles
                        if (invaderFound && projectileFound) {
                            createParticles(invader, 'yellow')

                            grid.invaders.splice(invaderIndex, 1)
                            projectiles.splice(projectileIndex, 1)

                            if (grid.invaders.length > 0) {
                                const firstInvader = grid.invaders[0]
                                const lastInvader = grid.invaders[grid.invaders.length - 1]
                                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                                grid.position.x = firstInvader.position.x
                            } else {
                                grids.splice(gridIndex, 1)
                            }
                        }
                    }, 0)
                }
            })
        })
    })

    if (keys.q.pressed && player.position.x >= 0) {
        player.velocity.x = -5
        player.rotation = -0.15
    } else if (keys.d.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 5
        player.rotation = +0.15
    } else {
        player.velocity.x = 0
        player.rotation = 0
    }

    // spawn ennemies
    if (frames % randomInterval === 0) {
        grids.push(new Grid())
        randomInterval = Math.floor(Math.random() * 500 + 500)
    }

    frames++
}

animate()

addEventListener('keydown', ({ key }) => {
    switch (key) {
        case 'q':
            player.velocity.x = -5
            keys.q.pressed = true
            break
        case 'd':
            keys.d.pressed = true
            break
        case ' ':
            projectiles.push(
                new Projectile(
                    {
                        x: player.position.x + player.width / 2,
                        y: player.position.y
                    },
                    {
                        x: 0,
                        y: -5
                    }
                )
            )
            break
    }
})

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'q':
            keys.q.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
        case ' ':
            break
    }
})