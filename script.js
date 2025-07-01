// script.js

let startScreen = document.getElementById("start-screen");
let gameScreen = document.getElementById("game-screen");
let endScreen = document.getElementById("end-screen");
let startBtn = document.getElementById("start-button");
let restartBtn = document.getElementById("restart-button");
let bucket = document.getElementById("bucket");
let gameArea = document.getElementById("game-area");
let scoreEl = document.getElementById("score");
let purityEl = document.getElementById("purity");
let timerEl = document.getElementById("timer");
let resultMessage = document.getElementById("result-message");
let finalStats = document.getElementById("final-stats");

let totalDrops = 0;
let cleanDrops = 0;
let gameInterval;
let dropInterval;
let secondsLeft = 30;

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

function startGame() {
  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  totalDrops = 0;
  cleanDrops = 0;
  secondsLeft = 30;
  updateHUD();
  bucket.style.left = "50%";

  dropInterval = setInterval(spawnRaindrop, 600); // adjust for difficulty
  gameInterval = setInterval(() => {
    secondsLeft--;
    timerEl.textContent = secondsLeft;
    if (secondsLeft <= 0) endGame();
  }, 1000);
}

function spawnRaindrop() {
  const drop = document.createElement("div");
  drop.classList.add("raindrop");
  drop.classList.add(Math.random() < 0.8 ? "clean" : "toxic");
  drop.style.left = `${Math.random() * 90}%`;
  drop.style.top = "0px";

  gameArea.appendChild(drop);

  let fallInterval = setInterval(() => {
    let top = parseInt(drop.style.top);
    if (top > gameArea.offsetHeight - 70) {
      clearInterval(fallInterval);
      checkCatch(drop);
      drop.remove();
    } else {
      drop.style.top = `${top + 5}px`;
    }
  }, 30);
}

function checkCatch(drop) {
  const dropRect = drop.getBoundingClientRect();
  const bucketRect = bucket.getBoundingClientRect();
  const caught =
    dropRect.bottom >= bucketRect.top &&
    dropRect.left < bucketRect.right &&
    dropRect.right > bucketRect.left;

  if (caught) {
    totalDrops++;
    if (drop.classList.contains("clean")) cleanDrops++;
    updateHUD();
  }
}

function updateHUD() {
  let purity = totalDrops ? Math.round((cleanDrops / totalDrops) * 100) : 100;
  scoreEl.textContent = `Water Collected: ${totalDrops}`;
  purityEl.textContent = `Purity: ${purity}%`;
}

function endGame() {
  clearInterval(dropInterval);
  clearInterval(gameInterval);
  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");

  const purity = totalDrops ? Math.round((cleanDrops / totalDrops) * 100) : 100;
  const win = purity >= 80 && totalDrops >= 10;

  resultMessage.textContent = win ? "You Win!" : "Try Again";
  finalStats.textContent = `Final Score: ${totalDrops} drops, Purity: ${purity}%`;
}

document.addEventListener("keydown", (e) => {
  const moveAmount = 20; // pixels per key press
  const gameAreaWidth = gameArea.offsetWidth;
  const bucketWidth = bucket.offsetWidth;
  let left = bucket.offsetLeft;

  if (e.key === "ArrowLeft") {
    left = Math.max(0, left - moveAmount);
  } else if (e.key === "ArrowRight") {
    left = Math.min(gameAreaWidth - bucketWidth, left + moveAmount);
  }

  bucket.style.left = `${left}px`;
});
