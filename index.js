const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Player {
    constructor() {
        this.velocity = {
            x: 0,
            y: 0
        }   
        
        this.rotation = 0

        const image = new Image()
        image.src = './img/spaceship.png'
        image.onload = () =>{
            const scale = .15
            this.image = image
            this.width = image.width *scale;
            this.height = image.height *scale;
            this.position = {
                x: canvas.width/2 - this.width/2,
                y: canvas.height - this.height*2
            }
        }
    }

    draw() {
        c.save()
        c.translate(player.position.x + player.width/2, 
                    player.position.y + player.height/2
        )
        c.rotate(this.rotation)

        c.translate(
            -player.position.x - player.width/2, 
            -player.position.y - player.height/2
        )

        c.drawImage(this.image, 
                    this.position.x, 
                    this.position.y, 
                    this.width, 
                    this.height
        )

        c.restore()
    }
    update(){
        if(this.image){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        }
    }
}

class Projectile{
    constructor({ position, velocity }) {
        this.position = position;
        this.velocity = velocity;
        this.radius = 5;
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        c.fillStyle = 'red';
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x; 
        this.position.y += this.velocity.y;
    }
}

class Invader {
    constructor(canSpawnAnywhere) {
        this.velocity = { x: 0, y: 1 };
        const image = new Image();
        image.src = './img/invader.png';
        image.onload = () => {
            const scale = 1;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;

            if (canSpawnAnywhere) {
                this.position = getSafeSpawnPosition(this.width, this.height);
            } else {
                this.position = {
                    x: Math.random() * (canvas.width - this.width),
                    y: -this.height - Math.random() * canvas.height
                };
            }
        };
    }

    draw() {
        c.drawImage(
            this.image,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        );
    }

    update() {
        if (this.image) {
            this.draw();
            const dx = player.position.x - this.position.x;
            const dy = player.position.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const invaderSpeed = 1;
            this.velocity.x = (dx / distance) * invaderSpeed;
            this.velocity.y = (dy / distance) * invaderSpeed;
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;

            if (
                this.position.x < player.position.x + player.width &&
                this.position.x + this.width > player.position.x &&
                this.position.y < player.position.y + player.height &&
                this.position.y + this.height > player.position.y
            ) {
                endGame();
            }
        }
    }
}

class FloatingText {
    constructor(text, position) {
        this.text = text;
        this.position = { ...position };
        this.alpha = 1;
        this.ySpeed = -1;
    }

    update() {
        this.position.y += this.ySpeed;
        this.alpha -= 0.02;
        this.draw();
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.fillStyle = "white";
        c.font = "20px sans-serif";
        c.textAlign = "center";
        c.fillText(this.text, this.position.x, this.position.y);
        c.restore();
    }
}


const player = new Player();
const projectiles = [];
const invaders = [];
const floatingTexts = [];


const keys = {
    ArrowLeft:{
        pressed:false
    },ArrowRight:{
        pressed:false
    },ArrowUp:{
        pressed:false
    },ArrowDown:{
        pressed:false
    },space:{
        pressed:false
    },KeyA:{
        pressed:false
    },KeyD:{
        pressed:false
    }
}

let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)

let gameRunning = true;
let startTime = Date.now()
let isLevelUp = false
let aliensKilled = 0;


let notification = {
    text: "",
    subtext: "",
    alpha: 0,
    timer: 0
};

function gameLoop() {
    if (!gameRunning) return; 

    requestAnimationFrame(gameLoop);
    c.fillStyle = 'black'
    c.fillRect(0,0,canvas.width, canvas.height)
    
    if (notification.alpha > 0) {
        c.save();
        c.globalAlpha = notification.alpha * 0.7;
        c.fillStyle = "yellow";
        c.font = "30px sans-serif";
        c.textAlign = "center";
        c.fillText(notification.text, canvas.width / 2, 50); 
        c.font = "20px sans-serif";
        c.fillText(notification.subtext, canvas.width / 2, 80);
        c.restore();

        const delta = 16;
        notification.timer -= delta;
        if (notification.timer <= 0) {
            notification.alpha -= 0.02;
            if (notification.alpha < 0) notification.alpha = 0;
        }
    }

    player.update();
    
    projectiles.forEach((projectile, index) =>{
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            },0)
        }else{
            projectile.update()
        }
    });

    invaders.forEach((invader, index) => {
        invader.update();

        
        projectiles.forEach((projectile, j) => {
            if (
                projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
                projectile.position.x + projectile.radius >= invader.position.x &&
                projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
                projectile.position.y + projectile.radius >= invader.position.y
            ) {
                setTimeout(() => {
                    invaders.splice(index, 1);
                    projectiles.splice(j, 1);
                    aliensKilled++;
                    floatingTexts.push(new FloatingText("+1", { 
                        x: invader.position.x + invader.width / 2, 
                        y: invader.position.y 
                    }))
                }, 0);
            }
        });
    });

    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        floatingTexts[i].update();
        if (floatingTexts[i].alpha <= 0) {
            floatingTexts.splice(i, 1);
        }
    }

   const elapsed = (Date.now() - startTime) / 1000
    if ((elapsed >= 100 || aliensKilled > 10) && !isLevelUp) {
        isLevelUp = true;
        showNotification("Rotation Unlocked!", "Press A and D to rotate", 5000);
    }
    if (isLevelUp) {
        handleRotation(player, keys)
    }

    if (keys.ArrowLeft.pressed && player.position.x >= 0) {
        player.velocity.x = -5
        if(!isLevelUp) player.rotation = -0.15
    } else if (keys.ArrowRight.pressed && player.position.x + player.width <= canvas.width) {
        player.velocity.x = 5
        if(!isLevelUp) player.rotation = 0.15
    } else {
        player.velocity.x = 0
        if(!isLevelUp) player.rotation = 0
    }

    if (keys.ArrowUp.pressed && player.position.y >= 0) {
        player.velocity.y = -5
    } else if (keys.ArrowDown.pressed && player.position.y + player.height <= canvas.height) {
        player.velocity.y = 5
    } else {
        player.velocity.y = 0
    }

    
    if (frames % randomInterval === 0) {
        invaders.push(new Invader(isLevelUp)); 
        randomInterval = Math.floor(Math.random() * 100 + 100);
        frames = 0;
    }
    frames++;

    c.save();
    c.fillStyle = "white";
    c.font = "25px sans-serif";
    c.textAlign = "left";
    c.fillText(`${aliensKilled}`, 20, 40);
    c.restore();

}

gameLoop();


addEventListener('keydown', ({key}) =>{
    switch(key){
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break
        case 'ArrowUp':
            keys.ArrowUp.pressed = true;
            break
        case 'ArrowDown':
            keys.ArrowDown.pressed = true;
            break
        case 'a':
            keys.KeyA.pressed = true;
            break
        case 'd':
            keys.KeyD.pressed = true;
            break
        case ' ':
            const speed = 10
            projectiles.push(new Projectile({
                    position:{
                        x:player.position.x + player.width/2,
                        y:player.position.y + player.height/2,
                    },
                    velocity: {
                        x: Math.cos(player.rotation - Math.PI/2) * speed,
                        y: Math.sin(player.rotation - Math.PI/2) * speed
                    }

            }))
            break
    }
})

addEventListener('keyup', ({key}) =>{
    switch(key){
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break
        case 'ArrowUp':
            keys.ArrowUp.pressed = false;
            break
        case 'ArrowDown':
            keys.ArrowDown.pressed = false;
            break
        case 'a':
            keys.KeyA.pressed = false;
            break
        case 'd':
            keys.KeyD.pressed = false;
            break
        case ' ':
            break
    }
})

function endGame() {
    gameRunning = false; 
    const result = confirm("Game over! Aliens Killed:" + aliensKilled + " Do you want to start over?");
    if (result) {
        restartGame();
    }
}

function restartGame() {
    gameRunning = true;
    aliensKilled = 0; 
    startTime = Date.now();
    isLevelUp = false;
    
    player.position = {
        x: canvas.width / 2 - player.width / 2,
        y: canvas.height - player.height * 2
    };

    invaders.forEach(invader => {
        invader.position = {
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height
        };
    });

    keys.ArrowLeft.pressed = false;
    keys.ArrowDown.pressed = false;
    keys.ArrowRight.pressed = false;
    keys.ArrowUp.pressed = false;
    keys.KeyA.pressed = false;
    keys.KeyD.pressed = false;
    keys.space.pressed = false;
}

function showNotification(text, subtext ,duration = 5000) {
    notification.text = text;
    notification.subtext = subtext;
    notification.alpha = 1;
    notification.timer = duration;
}

function handleRotation(player, keys) {
    if (keys.KeyA.pressed) {
        player.rotation -= 0.05
    }
    if (keys.KeyD.pressed) {
        player.rotation += 0.05
    }
}

function getSafeSpawnPosition(width, height) {
    let x, y;
    const minDistance = player.radius + Math.max(width, height) / 2 + 30; 
    do {
        x = Math.random() * (canvas.width - width);
        y = Math.random() * (canvas.height - height);

        const dx = (x + width/2) - (player.position.x + player.width/2);
        const dy = (y + height/2) - (player.position.y + player.height/2);
        var distance = Math.sqrt(dx * dx + dy * dy);

    } while (distance < minDistance);
    return { x, y };
}
