const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let username = "";
let mode = "";
let player = { x: 500, y: 400, dir: 0, color: "white", alive: true };
let foods = [];
let aiSnakes = [];
let targetSnakes = [];
let keys = {};

function enterUsername() {
  username = document.getElementById("usernameInput").value.trim();
  if (!username) return alert("Please enter a username.");
  document.getElementById("usernameMenu").style.display = "none";
  document.getElementById("modeMenu").style.display = "flex";
}

function startMode(selectedMode) {
  mode = selectedMode;
  document.getElementById("modeMenu").style.display = "none";
  canvas.style.display = "block";
  if (mode === "assassin") startAssassinMode();
}

function startAssassinMode() {
  player = { x: 500, y: 400, dir: 0, color: "white", alive: true, segments: [] };
  foods = generateFoods(100);
  aiSnakes = generateAISnakes(30, "yellow");
  targetSnakes = generateAISnakes(2, "blue");
  requestAnimationFrame(gameLoop);
}

function generateFoods(n) {
  let arr = [];
  for (let i = 0; i < n; i++) {
    arr.push({ x: Math.random() * 2000 - 1000, y: Math.random() * 2000 - 1000, color: "red" });
  }
  return arr;
}

function generateAISnakes(count, color) {
  let arr = [];
  for (let i = 0; i < count; i++) {
    arr.push({
      x: Math.random() * 2000 - 1000,
      y: Math.random() * 2000 - 1000,
      color,
      segments: [],
      alive: true,
    });
  }
  return arr;
}

function gameLoop() {
  if (!player.alive) return showMessage("You Died. Refresh to Try Again.");
  if (targetSnakes.every(s => !s.alive)) return showMessage("Assassination Complete!");

  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  if (keys["ArrowLeft"] || keys["a"]) player.dir -= 0.05;
  if (keys["ArrowRight"] || keys["d"]) player.dir += 0.05;
  player.x += Math.cos(player.dir) * 2;
  player.y += Math.sin(player.dir) * 2;

  // AI snakes move toward player
  aiSnakes.forEach(snake => {
    if (!snake.alive) return;
    let dx = player.x - snake.x;
    let dy = player.y - snake.y;
    let angle = Math.atan2(dy, dx);
    snake.x += Math.cos(angle) * 1.5;
    snake.y += Math.sin(angle) * 1.5;

    if (distance(player, snake) < 15) player.alive = false;
  });

  // Targets don’t attack
  targetSnakes.forEach(target => {
    if (!target.alive) return;
    if (distance(player, target) < 15) target.alive = false;
  });

  // Check for food
  foods.forEach(f => {
    if (distance(player, f) < 10) f.x = Math.random() * 2000 - 1000, f.y = Math.random() * 2000 - 1000;
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2 - player.x, canvas.height / 2 - player.y);

  // Draw food
  foods.forEach(f => {
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.arc(f.x, f.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw AI
  aiSnakes.forEach(s => {
    if (!s.alive) return;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw targets
  targetSnakes.forEach(s => {
    if (!s.alive) return;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });

  // Draw player
  if (player.alive) {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.fillText(username, player.x - 20, player.y - 15);
  }

  ctx.restore();

  // Minimap
  drawMinimap();
}

function drawMinimap() {
  const size = 150;
  const cx = canvas.width - size - 10;
  const cy = canvas.height - size - 10;

  ctx.fillStyle = "#222";
  ctx.beginPath();
  ctx.arc(cx + size / 2, cy + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  function drawDot(x, y, color) {
    let mx = ((x + 1000) / 2000) * size;
    let my = ((y + 1000) / 2000) * size;
    ctx.fillStyle = color;
    ctx.fillRect(cx + mx - 2, cy + my - 2, 4, 4);
  }

  if (player.alive) drawDot(player.x, player.y, "white");
  aiSnakes.forEach(s => s.alive && drawDot(s.x, s.y, "yellow"));
  targetSnakes.forEach(s => s.alive && drawDot(s.x, s.y, "blue"));
  foods.forEach(f => drawDot(f.x, f.y, "red"));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function showMessage(text) {
  ctx.fillStyle = "white";
  ctx.font = "30px sans-serif";
  ctx.fillText(text, canvas.width / 2 - 150, canvas.height / 2);
}

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);
