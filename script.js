let username = '';
let canvas = document.getElementById('gameCanvas');
let ctx = canvas.getContext('2d');
let gameRunning = false;

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

  // Dummy setup for Assassination Mode
  let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 10,
    color: 'green'
  };

  let blueSnakes = [
    { x: 100, y: 100, size: 10 },
    { x: 700, y: 500, size: 10 }
  ];

  let yellowSnakes = [
    { x: 300, y: 300, size: 10 },
    { x: 500, y: 200, size: 10 }
  ];

  let food = [
    { x: 400, y: 250, size: 5 },
    { x: 600, y: 400, size: 5 }
  ];

  // Game Loop
  function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fill();

    // Draw blue snakes (targets)
    ctx.fillStyle = 'blue';
    blueSnakes.forEach(snake => {
      ctx.beginPath();
      ctx.arc(snake.x, snake.y, snake.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw yellow snakes (attackers)
    ctx.fillStyle = 'yellow';
    yellowSnakes.forEach(snake => {
      ctx.beginPath();
      ctx.arc(snake.x, snake.y, snake.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw food
    ctx.fillStyle = 'red';
    food.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Basic Game Movement Logic for the Player (WASD controls)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'w') player.y -= 5;
      if (e.key === 's') player.y += 5;
      if (e.key === 'a') player.x -= 5;
      if (e.key === 'd') player.x += 5;
    });

    // Collision detection for player with food
    food.forEach((f, index) => {
      if (Math.hypot(player.x - f.x, player.y - f.y) < player.size + f.size) {
        food.splice(index, 1); // Remove food
        // Add player size growth
        player.size += 2;
      }
    });

    // Check for collisions with blue snakes (win condition)
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

    // Loop again
    requestAnimationFrame(gameLoop);
  }

  gameLoop(); // Start the game loop
}
