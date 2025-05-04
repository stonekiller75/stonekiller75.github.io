let username = '';
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let gameRunning = false;
let yellowAI = [];
let blueSnakes = [];
let food = [];
let player = {};
let message = "Get past the Yellow Snake Department Security, and kill the blue snakes. Use the map to help you.";

// Function to go to the mode menu
function goToModeMenu() {
  username = document.getElementById('usernameInput').value.trim();
  if (!username) {
    alert("Please enter a username.");
    return;
  }

  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('modeMenu').style.display = 'flex';
}

// Function to start Assassination Mode
function startAssassinationMode() {
  document.getElementById('modeMenu').style.display = 'none';
  document.getElementById('gameCanvas').style.display = 'block';
  startGame(); // Start the game
}

// Function to show 'In Progress' screen for other modes
function showInProgress() {
  document.getElementById('modeMenu').style.display = 'none';
  document.getElementById('inProgress').style.display = 'block';
}

// Start the game (Assassination Mode)
function startGame() {
  gameRunning = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

  // Create player snake
  player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 10,
    color: 'green',
    direction: { x: 0, y: 0 },
    body: [{ x: canvas.width / 2, y: canvas.height / 2 }] // Snake body as an array of segments
  };

  // Create blue snakes (targets)
  blueSnakes = [
    { x: 100, y: 100, size: 10, color: 'blue' },
    { x: 700, y: 500, size: 10, color: 'blue' }
  ];

  // Create yellow AI snakes to protect blue snakes
  yellowAI = [
    { x: 300, y: 300, size: 8, color: 'yellow', target: blueSnakes[0] },
    { x: 500, y: 200, size: 8, color: 'yellow', target: blueSnakes[0] },
    { x: 200, y: 400, size: 8, color: 'yellow', target: blueSnakes[1] },
    { x: 600, y: 300, size: 8, color: 'yellow', target: blueSnakes[1] },
    { x: 350, y: 100, size: 8, color: 'yellow', target: blueSnakes[0] },
    { x: 650, y: 500, size: 8, color: 'yellow', target: blueSnakes[1] },
    { x: 450, y: 500, size: 8, color: 'yellow', target: blueSnakes[0] },
    { x: 250, y: 250, size: 8, color: 'yellow', target: blueSnakes[1] }
  ];

  // Create food
  food = [
    { x: 400, y: 250, size: 5 },
    { x: 600, y: 400, size: 5 }
  ];

  // Game Loop
  function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw message
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(message, 20, 30);

    // Move and draw the player
    movePlayer();
    drawSnake(player);

    // Draw blue snakes (targets)
    blueSnakes.forEach(snake => drawSnake(snake));

    // Draw yellow AI snakes (protecting)
    yellowAI.forEach(snake => drawSnake(snake));

    // Draw food
    ctx.fillStyle = 'red';
    food.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Game logic for player movements
    window.addEventListener('keydown', (e) => {
      if (e.key === 'w') player.direction = { x: 0, y: -5 };
      if (e.key === 's') player.direction = { x: 0, y: 5 };
      if (e.key === 'a') player.direction = { x: -5, y: 0 };
      if (e.key === 'd') player.direction = { x: 5, y: 0 };
    });

    // Check for body collision
    checkBodyCollision();

    // Collision detection for player with food
    food.forEach((f, index) => {
      if (Math.hypot(player.x - f.x, player.y - f.y) < player.size + f.size) {
        food.splice(index, 1); // Remove food
        // Add player size growth
        player.size += 2;
      }
    });

    // Collision with blue snakes
    blueSnakes.forEach((snake, index) => {
      if (Math.hypot(player.x - snake.x, player.y - snake.y) < player.size + snake.size) {
        alert("You killed a target snake!");
        blueSnakes.splice(index, 1); // Remove the target snake
        if (blueSnakes.length === 0) {
          alert("Assassination Complete!");
          gameRunning = false;
        }
      }
    });

    // Protecting yellow AI logic
    yellowAI.forEach(ai => {
      moveAI(ai);
      protectBlueSnake(ai);
    });

    // Loop again
    requestAnimationFrame(gameLoop);
  }

  // Move the player
  function movePlayer() {
    player.x += player.direction.x;
    player.y += player.direction.y;
    player.body.unshift({ x: player.x, y: player.y }); // Add new head position
    if (player.body.length > player.size) {
      player.body.pop(); // Remove the tail if the snake is longer than its size
    }
  }

  // Draw snake
  function drawSnake(snake) {
    ctx.fillStyle = snake.color;
    ctx.beginPath();
    ctx.arc(snake.x, snake.y, snake.size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Check if player collides with its own body
  function checkBodyCollision() {
    for (let i = 1; i < player.body.length; i++) {
      if (Math.hypot(player.x - player.body[i].x, player.y - player.body[i].y) < player.size) {
        gameRunning = false; // End the game
        alert("Game Over! You collided with your own body!");
      }
    }
  }

  // Move and protect blue snake logic for AI
  function moveAI(ai) {
    let target = ai.target;
    if (target) {
      let angle = Math.atan2(target.y - ai.y, target.x - ai.x);
      ai.x += Math.cos(angle) * 2; // Move towards the blue snake
      ai.y += Math.sin(angle) * 2;
    }
  }

  // AI protects the blue snakes (staying near them)
  function protectBlueSnake(ai) {
    let target = ai.target;
    if (Math.hypot(ai.x - target.x, ai.y - target.y) < 50) {
      ai.x = target.x;
      ai.y = target.y;
    }
  }

  gameLoop(); // Start the game loop
}
