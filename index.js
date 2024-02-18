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
    constructor() {
        this.velocity = {
            x: 0,
            y: 1
        };

        const image = new Image();
        image.src = './img/invader.png';
        image.onload = () => {
            const scale = 1;
            this.image = image;
            this.width = image.width * scale;
            this.height = image.height * scale;
            this.position = {
                x: Math.random() * canvas.width, 
                y: Math.random() * -canvas.height
            };
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

function endGame() {
    gameRunning = false; 
    const result = confirm("Game over! Do you want to restart?");
    if (result) {
        restartGame();
    }
}

function restartGame() {
   
    gameRunning = true;
    player.position.x;
    player.position.y;

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
}
const player = new Player();
const projectiles = [];
const invaders = [];

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
    }
}

let frames = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)

let gameRunning = true;
function gameLoop() {
    if (!gameRunning) return; 

    requestAnimationFrame(gameLoop);
    c.fillStyle = 'black'
    c.fillRect(0,0,canvas.width, canvas.height)
    

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
                projectile.position.y - projectile.radius <=
                    invader.position.y + invader.height &&
                projectile.position.x + projectile.radius >=
                    invader.position.x &&
                projectile.position.x - projectile.radius <=
                    invader.position.x + invader.width &&
                projectile.position.y + projectile.radius >=
                    invader.position.y
            ) {
                setTimeout(() => {
                    invaders.splice(index, 1);
                    projectiles.splice(j, 1);
                }, 0);
            }
        });
    });


    if(keys.ArrowLeft.pressed && player.position.x >=0){
        player.velocity.x = -5
        player.rotation = -0.15
    }else if(keys.ArrowRight.pressed && player.position.x + player.width <= canvas.width){
        player.velocity.x = 5
        player.rotation = 0.15
    }else{
        player.velocity.x = 0
        player.rotation = 0
    }
    
    if(keys.ArrowUp.pressed && player.position.y >=0){
        player.velocity.y = -5
    }else if(keys.ArrowDown.pressed && player.position.y + player.height <= canvas.height){
        player.velocity.y = 5
    }else{
        player.velocity.y = 0
    }
    
    if (frames % randomInterval === 0) {
        invaders.push(new Invader()); 
        randomInterval = Math.floor(Math.random() * 100 + 100);
        frames = 0;
    }
    frames++;
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
        case ' ':
            projectiles.push(new Projectile({
                    position:{
                        x:player.position.x + player.width/2,
                        y:player.position.y
                    },
                    velocity:{
                        x:0,
                        y:-10
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
        case ' ':
            break
    }
})