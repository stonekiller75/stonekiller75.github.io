const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const worldSize = 2000;
const worldRadius = worldSize / 2;
let player = { name: "Player", body: [{ x: 0, y: 0 }], dir: { x: 1, y: 0 }, alive: true, length: 5 };
let foodItems = [];
let aiSnakes = [];
let mapExpanded = false;
let restartButtonVisible = false;
let levelComplete = false;

function spawnFood(count = 50) {
  while (foodItems.length < count) {
    const food = {
      x: Math.random() * worldSize - worldRadius,
      y: Math.random() * worldSize - worldRadius,
    };
    foodItems.push(food);
  }
}

function spawnAISnakes(count = 35) {
  aiSnakes = [];
  for (let i = 0; i < count; i++) {
    aiSnakes.push({
      name: "AI #" + (i + 1),
      body: [{
        x: Math.random() * worldSize - worldRadius,
        y: Math.random() * worldSize - worldRadius
      }],
      dir: { x: Math.random(), y: Math.random() },
      alive: true,
      length: 6
    });
  }
}

function normalizeDir(dx, dy) {
  const mag = Math.hypot(dx, dy);
  return mag ? { x: dx / mag, y: dy / mag } : { x: 1, y: 0 };
}

function updateAI() {
  aiSnakes.forEach(ai => {
    if (!ai.alive) return;
    const head = ai.body[0];

    // Chase the player aggressively
    let target = player;
    let dx = target.body[0].x - head.x;
    let dy = target.body[0].y - head.y;
    ai.dir = normalizeDir(dx, dy);

    // Movement
    let newX = head.x + ai.dir.x * 2.8;
    let newY = head.y + ai.dir.y * 2.8;

    if (Math.hypot(newX, newY) > worldRadius) {
      ai.dir.x *= -1;
      ai.dir.y *= -1;
    } else {
      ai.body.unshift({ x: newX, y: newY });
      if (ai.body.length > ai.length) ai.body.pop();
    }

    // Eat food
    foodItems = foodItems.filter(food => {
      if (Math.hypot(food.x - newX, food.y - newY) < 12) {
        ai.length++;
        return false;
      }
      return true;
    });
  });
}

function handleCollisions() {
  const snakes = [player, ...aiSnakes];
  snakes.forEach(snake => {
    if (!snake.alive) return;

    snakes.forEach(target => {
      if (snake === target || !target.alive) return;

      const snakeHead = snake.body[0];
      for (let i = 1; i < target.body.length; i++) {
        const part = target.body[i];
        if (Math.hypot(snakeHead.x - part.x, snakeHead.y - part.y) < 10) {
          snake.alive = false;
          dropFood(snake);
        }
      }
    });
  });
}

function dropFood(snake) {
  snake.body.forEach(segment => foodItems.push({ x: segment.x, y: segment.y }));
}

function update() {
  if (!player.alive) {
    restartButtonVisible = true;
    return;
  }

  let head = {
    x: player.body[0].x + player.dir.x * 3.2,
    y: player.body[0].y + player.dir.y * 3.2
  };

  if (Math.hypot(head.x, head.y) > worldRadius) {
    player.dir.x *= -1;
    player.dir.y *= -1;
    head = {
      x: player.body[0].x + player.dir.x * 3.2,
      y: player.body[0].y + player.dir.y * 3.2
    };
  }

  player.body.unshift(head);
  if (player.body.length > player.length) player.body.pop();

  foodItems = foodItems.filter(food => {
    if (Math.hypot(player.body[0].x - food.x, player.body[0].y - food.y) < 15) {
      player.length++;
      return false;
    }
    return true;
  });

  updateAI();
  handleCollisions();
  spawnFood();

  if (!levelComplete && aiSnakes.every(ai => !ai.alive)) {
    levelComplete = true;
  }
}

let offsetX, offsetY;
function drawSnake(snake, color) {
  snake.body.forEach((segment, i) => {
    const opacity = 1 - i / snake.body.length;
    ctx.fillStyle = `rgba(${color},${opacity})`;
    ctx.beginPath();
    ctx.arc(segment.x - offsetX, segment.y - offsetY, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawMinimap() {
  const size = mapExpanded ? 300 : 100;
  const x = mapExpanded ? (canvas.width / 2 - size / 2) : (canvas.width - size - 20);
  const y = mapExpanded ? (canvas.height / 2 - size / 2) : (canvas.height - size - 20);
  const scale = size / (2 * worldRadius);
  ctx.save();

  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#222";
  ctx.fillRect(x, y, size, size);

  function drawDot(x0, y0, color, r = 2) {
    const dx = x + size / 2 + x0 * scale;
    const dy = y + size / 2 + y0 * scale;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(dx, dy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  foodItems.forEach(f => drawDot(f.x, f.y, "red", 1));
  aiSnakes.forEach(ai => ai.alive && drawDot(ai.body[0].x, ai.body[0].y, "yellow", 2));
  if (player.alive) drawDot(player.body[0].x, player.body[0].y, "lime", 2.5);
  ctx.restore();
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.font = "16px Arial";
  ctx.fillText(`Length: ${player.length}`, canvas.width / 2, canvas.height - 40);

  if (restartButtonVisible) {
    ctx.fillStyle = "red";
    ctx.fillRect(canvas.width / 2 - 60, canvas.height / 2 - 30, 120, 60);
    ctx.fillStyle = "white";
    ctx.fillText("RESTART", canvas.width / 2, canvas.height / 2 + 5);
  }

  if (levelComplete) {
    ctx.fillStyle = "black";
    ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 - 80, 200, 130);
    ctx.strokeStyle = "white";
    ctx.strokeRect(canvas.width / 2 - 100, canvas.height / 2 - 80, 200, 130);

    ctx.fillStyle = "lime";
    ctx.font = "20px Arial";
    ctx.fillText("You Achieved Level 1", canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = "orange";
    ctx.fillRect(canvas.width / 2 - 70, canvas.height / 2, 140, 40);
    ctx.fillStyle = "black";
    ctx.fillText("Start Level 2", canvas.width / 2, canvas.height / 2 + 25);
  }
}

function draw() {
  offsetX = player.body[0].x - canvas.width / 2;
  offsetY = player.body[0].y - canvas.height / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  foodItems.forEach(f => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(f.x - offsetX, f.y - offsetY, 6, 0, Math.PI * 2);
    ctx.fill();
  });

  if (player.alive) drawSnake(player, "0,255,0");
  aiSnakes.forEach(ai => ai.alive && drawSnake(ai, "255,255,0"));

  drawMinimap();
  drawUI();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();
  if (key === "w" || key === "arrowup") player.dir = { x: 0, y: -1 };
  if (key === "s" || key === "arrowdown") player.dir = { x: 0, y: 1 };
  if (key === "a" || key === "arrowleft") player.dir = { x: -1, y: 0 };
  if (key === "d" || key === "arrowright") player.dir = { x: 1, y: 0 };
  if (key === "m") mapExpanded = !mapExpanded;
});

canvas.addEventListener("click", e => {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  if (restartButtonVisible &&
      e.x >= cx - 60 && e.x <= cx + 60 &&
      e.y >= cy - 30 && e.y <= cy + 30) {
    restartGame();
  }

  if (levelComplete &&
      e.x >= cx - 70 && e.x <= cx + 70 &&
      e.y >= cy && e.y <= cy + 40) {
    startLevel2();
  }
});

function restartGame() {
  player.alive = true;
  player.body = [{ x: 0, y: 0 }];
  player.dir = { x: 1, y: 0 };
  player.length = 5;
  spawnFood();
  spawnAISnakes();
  restartButtonVisible = false;
  levelComplete = false;
}

function startLevel2() {
  spawnAISnakes(40); // More aggressive AI
  aiSnakes.forEach(ai => ai.length = 8); // Start larger
  levelComplete = false;
  player.body = [{ x: 0, y: 0 }];
  player.length = 5;
  player.dir = { x: 1, y: 0 };
  player.alive = true;
  spawnFood();
}

spawnFood();
spawnAISnakes();
loop();
