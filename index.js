import {Player} from "./js/Player"
import {Projectile} from "./js/Projectile"

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


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

class Counter {
    constructor() {
        this.counter = 0;
    }

    incrementCounter() {
        this.counter++;
    }

    drawCounter() {

        c.strokeStyle = 'white'; // Change to the desired color

        // Draw border
        c.lineWidth = 2;
        c.strokeRect(10, 35, 160, 40);

        c.fillRect(10, 35, 160, 40);

        // Set font style
        c.font = "18px monospace";
        c.fillStyle = "white";
        
        // Draw text
        c.fillText("Enemy count: " + this.counter, 20, 60);
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
    counter.counter = 0;
}

const player = new Player();
const projectiles = [];
const invaders = [];
const counter = new Counter();

const keys = {
    ArrowLeft: {pressed: false},
    ArrowRight: {pressed: false},
    ArrowUp: {pressed: false},
    ArrowDown: {pressed: false},
    space: {pressed: false}
};

let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 500);
let gameRunning = true;

function gameLoop() {
    if (!gameRunning) return; 

    requestAnimationFrame(gameLoop);
    c.fillStyle = 'black';
    c.fillRect(0,0,canvas.width, canvas.height);
    
    player.update();
    counter.drawCounter();
    
    projectiles.forEach((projectile, index) =>{
        if (projectile.position.y + projectile.radius <= 0) {
            setTimeout(() => {
                projectiles.splice(index, 1);
            },0);
        } else {
            projectile.update();
        }
    });

    invaders.forEach((invader, index) => { invader.update();

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
                    counter.incrementCounter();
                }, 0);
            }
        });
    });

    if(keys.ArrowLeft.pressed && player.position.x >=0){
        player.velocity.x = -5;
        player.rotation = -0.15;
    } else if(keys.ArrowRight.pressed && player.position.x + player.width <= canvas.width){
        player.velocity.x = 5;
        player.rotation = 0.15;
    } else{
        player.velocity.x = 0;
        player.rotation = 0;
    }
    
    if(keys.ArrowUp.pressed && player.position.y >=0){
        player.velocity.y = -5;
    } else if(keys.ArrowDown.pressed && player.position.y + player.height <= canvas.height){
        player.velocity.y = 5;
    } else{
        player.velocity.y = 0;
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
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = true;
            break;
        case 'ArrowDown':
            keys.ArrowDown.pressed = true;
            break;
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
            }));
            break;
    }
});

addEventListener('keyup', ({key}) =>{
    switch(key){
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = false;
            break;
        case 'ArrowDown':
            keys.ArrowDown.pressed = false;
            break;
        case ' ':
            break;
    }
});
