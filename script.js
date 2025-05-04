let player;
let aiSnakes = [];
let food = [];
let username = "";
let mode = "Assassination";
let gameStarted = false;
let canvas, ctx;
let minimap;

const gridSize = 10; // Size of each grid block for the snake and food
const aiSnakeCount = 8; // Number of AI snakes to protect the blue snakes
const gameSpeed = 10; // Game speed, higher is faster

// Screen States
const gameScreen = document.getElementById("gameScreen");
const modeMenu = document.getElementById("modeMenu");
const startScreen = document.getElementById("startScreen");
const backButton = document.getElementById("backButton");

function goToModeMenu() {
    username = document.getElementById("usernameInput").value;
    if (!username) {
        alert("Please enter a username.");
        return;
    }
    startScreen.style.display = "none";
    modeMenu.style.display = "flex";
}

function startAssassinationMode() {
    modeMenu.style.display = "none";
    gameScreen.style.display = "block";
    initGame();
}

function showInProgress() {
    modeMenu.style.display = "none";
    document.getElementById("inProgress").style.display = "flex";
}

function goBack() {
    if (gameStarted) {
        location.reload(); // Restart the game by reloading the page
    } else {
        gameScreen.style.display = "none";
        modeMenu.style.display = "flex";
    }
}

// Game initialization
function initGame() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    minimap = document.createElement("canvas");
    minimap.width = 150;
    minimap.height = 150;

    player = {
        body: [{x: 150, y: 150}],
        direction: "RIGHT",
        length: 3,
        color: "green"
    };

    for (let i = 0; i < aiSnakeCount; i++) {
        aiSnakes.push(createAISnake());
    }

    spawnFood(5);
    gameStarted = true;
    gameLoop();
}

// Create an AI snake
function createAISnake() {
    return {
        body: [{x: Math.random() * canvas.width, y: Math.random() * canvas.height}],
        direction: "LEFT",
        length: 3,
        color: "yellow",
        target: "player"
    };
}

// Spawn food at random locations
function spawnFood(count) {
    for (let i = 0; i < count; i++) {
        food.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        });
    }
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    moveAISnakes();
    checkCollisions();
    drawPlayer();
    drawAISnakes();
    drawFood();
    drawMinimap();

    setTimeout(gameLoop, 1000 / gameSpeed); // Controls game speed
}

// Player movement
function movePlayer() {
    const head = Object.assign({}, player.body[0]);
    if (player.direction === "LEFT") head.x -= gridSize;
    if (player.direction === "RIGHT") head.x += gridSize;
    if (player.direction === "UP") head.y -= gridSize;
    if (player.direction === "DOWN") head.y += gridSize;

    player.body.unshift(head);
    if (player.body.length > player.length) {
        player.body.pop();
    }
}

// AI movement
function moveAISnakes() {
    aiSnakes.forEach((ai) => {
        const head = Object.assign({}, ai.body[0]);
        if (ai.direction === "LEFT") head.x -= gridSize;
        if (ai.direction === "RIGHT") head.x += gridSize;
        if (ai.direction === "UP") head.y -= gridSize;
        if (ai.direction === "DOWN") head.y += gridSize;

        ai.body.unshift(head);
        if (ai.body.length > ai.length) {
            ai.body.pop();
        }
    });
}

// Collision detection
function checkCollisions() {
    aiSnakes.forEach((ai) => {
        // Collision with player's body
        if (isCollision(player.body, ai.body[0])) {
            ai.body = ai.body.slice(0, -1); // AI dies if it hits player's body
        }
    });
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = player.color;
    player.body.forEach((segment) => {
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });
}

// Draw AI snakes
function drawAISnakes() {
    aiSnakes.forEach((ai) => {
        ctx.fillStyle = ai.color;
        ai.body.forEach((segment) => {
            ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        });
    });
}

// Draw food
function drawFood() {
    ctx.fillStyle = "red";
    food.forEach((f) => {
        ctx.fillRect(f.x, f.y, gridSize, gridSize);
    });
}

// Draw minimap
function drawMinimap() {
    const miniCtx = minimap.getContext("2d");
    miniCtx.clearRect(0, 0, minimap.width, minimap.height);
    miniCtx.fillStyle = "green";
    player.body.forEach((segment) => {
        miniCtx.fillRect(segment.x / 5, segment.y / 5, gridSize / 5, gridSize / 5);
    });

    aiSnakes.forEach((ai) => {
        miniCtx.fillStyle = ai.color;
        ai.body.forEach((segment) => {
            miniCtx.fillRect(segment.x / 5, segment.y / 5, gridSize / 5, gridSize / 5);
        });
    });

    miniCtx.fillStyle = "red";
    food.forEach((f) => {
        miniCtx.fillRect(f.x / 5, f.y / 5, gridSize / 5, gridSize / 5);
    });

    ctx.drawImage(minimap, canvas.width - minimap.width - 10, canvas.height - minimap.height - 10);
}

// Helper function for collision detection
function isCollision(body1, body2) {
    return body1[0].x === body2.x && body1[0].y === body2.y;
}

// Key event listeners for movement
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") {
        player.direction = "LEFT";
    } else if (e.key === "ArrowRight" || e.key === "d") {
        player.direction = "RIGHT";
    } else if (e.key === "ArrowUp" || e.key === "w") {
        player.direction = "UP";
    } else if (e.key === "ArrowDown" || e.key === "s") {
        player.direction = "DOWN";
    }
});
