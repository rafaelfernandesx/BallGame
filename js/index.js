const canvas = document.querySelector('canvas')
canvas.width = innerWidth;
canvas.height = innerHeight - 10;

const c = canvas.getContext('2d');

class Player {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}


class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}


class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x,y, 10, 'white');
const projectiles = [];
const enemies = [];
const particles = [];

function spawnEnemies() {

    setInterval(() => {
        const radius = Math.random() * (30 -8) +8;
        let x
        let y
        if (Math.random() > 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            y = Math.random() * canvas.height;
        }else{
            x = Math.random() * canvas.width;
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

        const angle = Math.atan2(canvas.height / 2 -y, canvas.width / 2 -x);
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 1000);
}

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0,0, canvas.width, canvas.height);
    player.draw();
    particles.forEach(particle => {
        particles.update()
    });

    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update();

        //remove os projectil da tela
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius >  canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {//tira o efeito de "flash" da colisão
                projectiles.splice(projectileIndex, 1)//remove o projetil
            }, 0);
        }
    })

    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        const distEnemyPlayer = Math.hypot(player.x - enemy.x, player.y - enemy.y);

        if (distEnemyPlayer - enemy.radius - player.radius < 1) { //colisão enemy player
            cancelAnimationFrame(animationId)
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const distProjectileEnemy = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            //colisão projetil enemy
            if (distProjectileEnemy - enemy.radius - projectile.radius < 1) {

                for (let i = 0; i < 8; i++) {
                    projectiles.push(new Particle(projectile.x, projectile.y, 3, enemy.color, { x: Math.random() - 0.5, y: Math.random() - 0.5}))
                }

                if (enemy.radius -10 > 5) {
                    gsap.to(enemy,{
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {//tira o efeito de "flash" da colisão
                        projectiles.splice(projectileIndex, 1)//remove o projetil
                    }, 0);
                }else{
                    setTimeout(() => {//tira o efeito de "flash" da colisão
                        enemies.splice(enemyIndex,1)//remove o inimigo
                        projectiles.splice(projectileIndex,1)//remove o projetil
                    }, 0);
                }
            }
        });
    })

}


addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity));
})

animate();
spawnEnemies();