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

// Store all active fall intervals for raindrops
let activeFallIntervals = [];

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

function startGame() {
  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  pauseMenu.classList.add("hidden");

  totalDrops = 0;
  cleanDrops = 0;
  secondsLeft = 30;
  updateHUD();
  bucket.style.left = "50%";

  document.getElementById("timer-circle").textContent = secondsLeft;

  dropInterval = setInterval(spawnRaindrop, 600);
  gameInterval = setInterval(() => {
    secondsLeft--;
    document.getElementById("timer-circle").textContent = secondsLeft;
    if (secondsLeft <= 0) endGame();
  }, 1000);
}

// Update spawnRaindrop to track each drop's interval
function spawnRaindrop() {
  const drop = document.createElement("div");
  drop.classList.add("raindrop");
  drop.classList.add(Math.random() < 0.8 ? "clean" : "toxic");

  // Set a random horizontal position (0% to 90% so it doesn't go off the edge)
  drop.style.left = `${Math.random() * 90}%`;

  // Always start at the top (just below clouds, or 0px if no clouds)
  drop.style.top = "70px"; // Start just below the clouds (adjust if needed)

  gameArea.appendChild(drop);

  // Create a fall interval for this drop
  let fallInterval = setInterval(() => {
    let top = parseInt(drop.style.top);
    if (top > gameArea.offsetHeight - 70) {
      clearInterval(fallInterval);
      // Remove this interval from the active list
      activeFallIntervals = activeFallIntervals.filter(obj => obj.interval !== fallInterval);
      checkCatch(drop);
      drop.remove();
    } else {
      drop.style.top = `${top + 5}px`;
    }
  }, 30);

  // Store both the drop and its interval so we can pause/resume
  activeFallIntervals.push({ drop, interval: fallInterval });
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


let resetBtn = document.getElementById("reset-button");
let backBtn = document.getElementById("back-button");

resetBtn.addEventListener("click", () => {
  clearInterval(dropInterval);
  clearInterval(gameInterval);
  const drops = document.querySelectorAll(".raindrop");
  drops.forEach(drop => drop.remove());
  startGame(); // restart fresh
});

backBtn.addEventListener("click", () => {
  clearInterval(dropInterval);
  clearInterval(gameInterval);
  const drops = document.querySelectorAll(".raindrop");
  drops.forEach(drop => drop.remove());
  gameScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

let pauseBtn = document.getElementById("pause-button");
let pauseMenu = document.getElementById("pause-menu");
let resumeBtn = document.getElementById("resume-btn");

// Pause logic
pauseBtn.addEventListener("click", () => {
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  pauseAllDrops(); // Stop all falling drops
  pauseMenu.classList.remove("hidden");
});

// Resume logic
resumeBtn.addEventListener("click", () => {
  pauseMenu.classList.add("hidden");
  resumeGame();
  resumeAllDrops(); // Resume all falling drops
});

function resumeGame() {
  dropInterval = setInterval(spawnRaindrop, 600);
  gameInterval = setInterval(() => {
    secondsLeft--;
    document.getElementById("timer-circle").textContent = secondsLeft;
    if (secondsLeft <= 0) endGame();
  }, 1000);
}

// Add a function to pause all falling drops
function pauseAllDrops() {
  // Loop through all active intervals and clear them
  activeFallIntervals.forEach(obj => {
    clearInterval(obj.interval);
  });
}

// Add a function to resume all falling drops
function resumeAllDrops() {
  // For each drop, start a new interval from its current position
  activeFallIntervals.forEach(obj => {
    // Only resume if the drop is still in the game area
    obj.interval = setInterval(() => {
      let top = parseInt(obj.drop.style.top);
      if (top > gameArea.offsetHeight - 70) {
        clearInterval(obj.interval);
        activeFallIntervals = activeFallIntervals.filter(o => o.interval !== obj.interval);
        checkCatch(obj.drop);
        obj.drop.remove();
      } else {
        obj.drop.style.top = `${top + 5}px`;
      }
    }, 30);
  });
}

// Reuse from earlier
resetBtn.addEventListener("click", () => {
  pauseMenu.classList.add("hidden");
  clearInterval(dropInterval);
  clearInterval(gameInterval);
  pauseAllDrops(); // Stop all falling drops
  activeFallIntervals = []; // Clear the list
  document.querySelectorAll(".raindrop").forEach(drop => drop.remove());
  startGame();
});

backBtn.addEventListener("click", () => {
  pauseMenu.classList.add("hidden");
  clearInterval(dropInterval);
  clearInterval(gameInterval);
  pauseAllDrops(); // Stop all falling drops
  activeFallIntervals = []; // Clear the list
  document.querySelectorAll(".raindrop").forEach(drop => drop.remove());
  gameScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

// Add clouds to the top of the game area
function addClouds() {
  const cloudRow = document.getElementById("cloud-row");
  cloudRow.innerHTML = ""; // Clear any existing clouds

  // Add 8 clouds (you can change this number)
  for (let i = 0; i < 8; i++) {
    const cloud = document.createElement("img");
    cloud.src = 'img/cloud.png'; // Make sure this matches your cloud image filename
    cloud.classList.add("cloud");
    cloudRow.appendChild(cloud);
  }
}

// Call this once when the page loads
addClouds();
