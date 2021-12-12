const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight - 10;

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')
const wallet = document.querySelector('#wallet')
const statusEl = document.querySelector('#status')


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
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

const friction = 0.97;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore()
    }

    update() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

let player = new Player(x,y, 10, 'white');
let projectiles = [];
let enemies = [];
let particles = [];

function init() {
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}

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
let score = 0;
function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0,0, canvas.width, canvas.height);
    player.draw();
    particles.forEach((particle, particleIndex) => {
        if (particle.alpha <= 0) {
            particles.splice(particleIndex, 1)
        }else{
            particle.update()
        }
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

        //colisão enemy player
        if (distEnemyPlayer - enemy.radius - player.radius < 1) {
            //cria o efeito de explosão do player
            for (let i = 0; i < player.radius * 2; i++) {
                particles.push(new Particle(player.x, player.y, Math.random() * 2, player.color, { x: (Math.random() - 0.5) * (Math.random() * 6), y: (Math.random() - 0.5) * (Math.random() * 6) }))
            }
            enemy.velocity ={x:0, y:0};
            projectiles = [];
            setTimeout(() => {
                cancelAnimationFrame(animationId);
                modalEl.style.display = 'flex';
                bigScoreEl.innerHTML = scoreEl.innerHTML;
                if (score >= 1) {
                    statusEl.style.display = "block";
                    fetch(`http://137.184.129.157:4000/get_reward`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            wallet: wallet.value,
                            amountToken: score
                        })
                    }).then(function (res){
                        res.json().then(function (json) {
                            console.log(json);
                            if (json.error == 0) {
                                statusEl.innerHTML = "Tokens enviado pra sua wallet!"
                            }else{
                                statusEl.innerHTML = "Erro ao enviar tokens!"
                            }
                        })
                    })
                    score = 0;
                }
            }, 1000);
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const distProjectileEnemy = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

            //colisão projetil enemy
            if (distProjectileEnemy - enemy.radius - projectile.radius < 1) {

                //cria o efeito de explosão
                for (let i = 0; i < enemy.radius*2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, { x: (Math.random() - 0.5) * (Math.random() * 6), y: (Math.random() - 0.5) * (Math.random() * 6)}))
                }

                if (enemy.radius - 10 > 5) {
                    //aumenta o score
                    score += 5;
                    scoreEl.innerHTML = score;

                    gsap.to(enemy,{
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {//tira o efeito de "flash" da colisão
                        projectiles.splice(projectileIndex, 1)//remove o projetil
                    }, 0);
                }else{
                    //aumenta o score em +2 por remover da tela (kill)
                    score += 10;
                    scoreEl.innerHTML = score;

                    setTimeout(() => {//tira o efeito de "flash" da colisão
                        enemies.splice(enemyIndex,1)//remove o inimigo
                        projectiles.splice(projectileIndex,1)//remove o projetil
                    }, 0);
                }
            }
        });
    })

}

let full = false;

addEventListener('keypress', (event) =>{
    let key = event.which || event.keyCode;
    if (key === 101) {
        full = !full;
        console.log(full)
    }

    if (full) {
        addEventListener('mousedown', addFireToWindown)
        addEventListener('mouseup', removeFireToWindown)
    }else{
        window.removeEventListener('mousedown', addFireToWindown)
        window.removeEventListener('mouseup', removeFireToWindown)
        window.removeEventListener('mousemove', fire)
    }
})

function addFireToWindown() {
    window.addEventListener('mousemove', fire)
}

function removeFireToWindown() {
    window.addEventListener('mousemove', fire)
}

function fire(event){
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2);
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity));
}


addEventListener('click', fire)

startGameBtn.addEventListener('click', () =>{
    init()
    animate();
    spawnEnemies();
    modalEl.style.display = 'none';
})