let username = '';
const startScreen = document.getElementById('startScreen');
const modeMenu = document.getElementById('modeMenu');
const inProgressScreen = document.getElementById('inProgressScreen');
const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');

function goToModeMenu() {
  username = document.getElementById('usernameInput').value.trim();
  if (!username) {
    alert("Please enter a username.");
    return;
  }
  startScreen.style.display = 'none';
  modeMenu.style.display = 'flex';
}

function startMode(mode) {
  modeMenu.style.display = 'none';
  if (mode === 'assassination') {
    startAssassinationMode();
  } else {
    inProgressScreen.style.display = 'flex';
  }
}

// ===== ASSASSINATION MODE =====
function startAssassinationMode() {
  gameCanvas.style.display = 'block';
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight;

  const player = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    speed: 2,
    size: 10,
    color: 'white',
    trail: [],
    length: 30
  };

  const food = [];
  const targetSnakes = [];
  const aiSnakes = [];

  const WORLD_RADIUS = 2000;

  // Key tracking
  const keys = {};
  window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
  window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

  function spawnFood() {
    for (let i = 0; i < 100; i++) {
      food.push({
        x: Math.random() * WORLD_RADIUS * 2 - WORLD_RADIUS,
        y: Math.random() * WORLD_RADIUS * 2 - WORLD_RADIUS,
        color: 'red'
      });
    }
  }

  function spawnTargetSnakes() {
    for (let i = 0; i < 2; i++) {
      targetSnakes.push({
        x: Math.random() * WORLD_RADIUS * 2 - WORLD_RADIUS,
        y: Math.random() * WORLD_RADIUS * 2 - WORLD_RADIUS,
        color: 'blue',
        size: 10,
        trail: [],
        length: 25
      });
    }
  }

  function spawnAISnakes() {
    for (let i = 0; i < 10; i++) {
      aiSnakes.push({
        x: Math.random() * WORLD_RADIUS * 2 - WORLD_RADIUS,
        y: Math.random() * WORLD_RADIUS * 2 - WORLD_RADIUS,
        color: 'yellow',
        size: 10,
        trail: [],
        length: 25
      });
    }
  }

  function movePlayer() {
    if (keys['w'] || keys['arrowup']) player.dy = -player.speed;
    else if (keys['s'] || keys['arrowdown']) player.dy = player.speed;
    else player.dy = 0;

    if (keys['a'] || keys['arrowleft']) player.dx = -player.speed;
    else if (keys['d'] || keys['arrowright']) player.dx = player.speed;
    else player.dx = 0;

    player.x += player.dx;
    player.y += player.dy;

    player.trail.push({ x: player.x, y: player.y });
    while (player.trail.length > player.length) {
      player.trail.shift();
    }
  }

  function drawSnake(snake) {
    ctx.fillStyle = snake.color;
    for (let t of snake.trail) {
      ctx.beginPath();
      ctx.arc(t.x, t.y, snake.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(snake.x, snake.y, snake.size, 0, Math.PI * 2);
    ctx.fill();
  }

  function moveAISnake(snake) {
    let angle = Math.atan2(0 - snake.y, 0 - snake.x);
    snake.x += Math.cos(angle) * 1.5;
    snake.y += Math.sin(angle) * 1.5;

    snake.trail.push({ x: snake.x, y: snake.y });
    while (snake.trail.length > snake.length) {
      snake.trail.shift();
    }
  }

  function drawFood() {
    for (let f of food) {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function eatFood() {
    for (let i = food.length - 1; i >= 0; i--) {
      const f = food[i];
      const dx = f.x - player.x;
      const dy = f.y - player.y;
      if (Math.hypot(dx, dy) < player.size + 5) {
        food.splice(i, 1);
        player.length += 5;
      }
    }
  }

  function checkCollisions() {
    for (let i = targetSnakes.length - 1; i >= 0; i--) {
      const t = targetSnakes[i];
      if (Math.hypot(t.x - player.x, t.y - player.y) < t.size + player.size) {
        targetSnakes.splice(i, 1);
        player.length += 10;
      }
    }

    for (let ai of aiSnakes) {
      if (Math.hypot(ai.x - player.x, ai.y - player.y) < ai.size + player.size) {
        endGame(false);
      }
    }

    if (targetSnakes.length === 0) {
      endGame(true);
    }
  }

  function endGame(won) {
    alert(won ? "Assassination Complete!" : "You Died!");
    location.reload();
  }

  function drawMinimap() {
    const mapRadius = 100;
    const cx = gameCanvas.width - mapRadius - 20;
    const cy = gameCanvas.height - mapRadius - 20;

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, mapRadius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.clip();

    function mapX(x) {
      return cx + (x / WORLD_RADIUS) * mapRadius;
    }

    function mapY(y) {
      return cy + (y / WORLD_RADIUS) * mapRadius;
    }

    for (let f of food) {
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(mapX(f.x), mapY(f.y), 2, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let t of targetSnakes) {
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(mapX(t.x), mapY(t.y), 4, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let ai of aiSnakes) {
      ctx.fillStyle = ai.color;
      ctx.beginPath();
      ctx.arc(mapX(ai.x), mapY(ai.y), 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(mapX(player.x), mapY(player.y), 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    ctx.save();
    ctx.translate(gameCanvas.width / 2 - player.x, gameCanvas.height / 2 - player.y);

    drawFood();
    drawSnake(player);
    for (let t of targetSnakes) drawSnake(t);
    for (let ai of aiSnakes) {
      moveAISnake(ai);
      drawSnake(ai);
    }

    ctx.restore();

    drawMinimap();
  }

  function gameLoop() {
    movePlayer();
    eatFood();
    checkCollisions();
    draw();
    requestAnimationFrame(gameLoop);
  }

  spawnFood();
  spawnTargetSnakes();
  spawnAISnakes();
  gameLoop();
}
