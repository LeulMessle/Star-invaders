const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gameOverDiv = document.getElementById("gameOver");
const scoreDisplay = document.getElementById("score");
const restartButton = document.getElementById("restartButton");


const playerSprite = new Image();
playerSprite.src = "player.png";
const enmySprite = new Image();
enmySprite.src = "enmy.png";
const backgroundImage = new Image();
backgroundImage.src = "backgroundspace.png";
const shootSound = new Audio("shoot.mp3");
const enmyDeathSound = new Audio("explode.mp3");
const themeSound = new Audio("theme.mp3");

const playerWidth = 30;
const playerHeight = 30;
let playerX = (canvas.width - playerWidth) / 2;
const playerSpeed = 20;
let bullets = [];
const bulletWidth = 5;
const bulletHeight = 10;
let bulletSpeed = 8;
let maxBullets = 1;
const enmyRows = 3;
const enmyColumns = 8;
const enmyWidth = 40;
const enmyHeight = 30;
const enmyPadding = 10;
let enmies = [];
let enmySpeed = 0.5;
let enmyDirection = 1;
let enmyBullets = [];
const enmyBulletSpeed = 3;
let gameOver = false;
let score = 0;
let wave = 1;

// Initialize enemies
function initializeEnmies() {
    enmies = [];
    for (let row = 0; row < enmyRows; row++) {
        for (let col = 0; col < enmyColumns; col++) {
            enmies.push({
                x: col * (enmyWidth + enmyPadding),
                y: row * (enmyHeight + enmyPadding),
                alive: true,
            });
        }
    }
}

initializeEnmies();

function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
    ctx.drawImage(playerSprite, playerX, canvas.height - playerHeight, playerWidth, playerHeight);
}

function drawBullets() {
    ctx.fillStyle = "#f00";
    bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
    });
}

function drawEnmies() {
    enmies.forEach((enmy) => {
        if (enmy.alive) {
            ctx.drawImage(enmySprite, enmy.x, enmy.y, enmyWidth, enmyHeight);
        }
    });
}

function drawEnmyBullets() {
    ctx.fillStyle = "#0ff";
    enmyBullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
    });
}

function movePlayer(direction) {
    playerX += direction * playerSpeed;
    if (playerX < 0) playerX = 0;
    if (playerX + playerWidth > canvas.width) playerX = canvas.width - playerWidth;
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        if (bullet.y < 0) bullets.splice(index, 1);
    });
}

function moveEnmies() {
    let edgeReached = false;
    enmies.forEach((enmy) => {
        if (enmy.alive) {
            enmy.x += enmySpeed * enmyDirection;
            if (enmy.x < 0 || enmy.x + enmyWidth > canvas.width) edgeReached = true;
        }
    });

    if (edgeReached) {
        enmyDirection *= -1;
        enmies.forEach((enmy) => {
            if (enmy.alive) enmy.y += enmyHeight;
        });
    }
}

function moveEnmyBullets() {
    enmyBullets.forEach((bullet, index) => {
        bullet.y += enmyBulletSpeed;
        if (bullet.y > canvas.height) enmyBullets.splice(index, 1);
    });
}

function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enmies.forEach((enmy, enmyIndex) => {
            if (
                enmy.alive &&
                bullet.x < enmy.x + enmyWidth &&
                bullet.x + bulletWidth > enmy.x &&
                bullet.y < enmy.y + enmyHeight &&
                bullet.y + bulletHeight > enmy.y
            ) {
                // Mark enemy as dead and remove bullet
                enmy.alive = false;
                bullets.splice(bulletIndex, 1);
                enmyDeathSound.play();
                score += 10;
                scoreDisplay.textContent = score;
            }
        });
    });

    // Check if all enemies are dead, then move to next wave
    if (enmies.every((enmy) => !enmy.alive)) {
        wave++;
        enmySpeed += 0.5;
        maxBullets++;
        bulletSpeed += 1;
        initializeEnmies();
    }
}

if (enmies.every((enmy) => !enmy.alive)) {
    wave++;
    enmySpeed += 0.5;
    maxBullets++;
    bulletSpeed += 1;
    initializeEnmies();
}


function restartGame() {
    gameOver = false;
    gameOverDiv.style.display = "none";
    restartButton.style.display = "none";
    score = 0;
    scoreDisplay.textContent = score;
    wave = 1;
    enmySpeed = 0.5;
    maxBullets = 1;
    bulletSpeed = 8;
    playerX = (canvas.width - playerWidth) / 2;
    bullets = [];
    enmyBullets = [];
    initializeEnmies();
    themeSound.play();
    gameLoop();
}

function gameLoop() {
    if (gameOver) {
        gameOverDiv.style.display = "block";
        restartButton.style.display = "block";
        themeSound.pause();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();
    drawPlayer();
    drawBullets();
    drawEnmies();
    drawEnmyBullets();

    moveBullets();
    moveEnmies();
    moveEnmyBullets();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    if (gameOver) return;
    if (e.key === "ArrowLeft") movePlayer(-1);
    else if (e.key === "ArrowRight") movePlayer(1);
    else if (e.key === " " && bullets.length < maxBullets) {
        bullets.push({ x: playerX + playerWidth / 2 - bulletWidth / 2, y: canvas.height - playerHeight - bulletHeight });
        shootSound.play();
    }
});

restartButton.addEventListener("click", restartGame);
gameLoop();
