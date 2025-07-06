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
  clearInterval(dropInterval);   // ✅ stop extras first
  clearInterval(gameInterval);   // ✅ stop extras first

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

  // Spawn the first raindrop immediately so the game starts right away
  spawnRaindrop();
  dropInterval = setInterval(spawnRaindrop, 600);
  gameInterval = setInterval(() => {
    secondsLeft--;
    document.getElementById("timer-circle").textContent = secondsLeft;
    if (secondsLeft <= 0) endGame();
  }, 1000);
}

// Refactored bucket move function for reuse
function moveBucket(direction) {
  const moveAmount = 20; // pixels per move
  const gameAreaWidth = gameArea.offsetWidth;
  const bucketWidth = bucket.offsetWidth;
  let left = bucket.offsetLeft;

  if (direction === "left") {
    left = Math.max(0, left - moveAmount);
  } else if (direction === "right") {
    left = Math.min(gameAreaWidth - bucketWidth, left + moveAmount);
  }

  bucket.style.left = `${left}px`;
}

// Keyboard controls use the refactored function
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    moveBucket("left");
  } else if (e.key === "ArrowRight") {
    moveBucket("right");
  }
});

// Touch swipe support for mobile devices
let touchStartX = null;

gameArea.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
});

gameArea.addEventListener("touchend", (e) => {
  if (touchStartX === null) return;
  let touchEndX = e.changedTouches[0].clientX;
  let diffX = touchEndX - touchStartX;

  const swipeThreshold = 30; // minimum distance to count as swipe

  if (diffX > swipeThreshold) {
    moveBucket("right");
  } else if (diffX < -swipeThreshold) {
    moveBucket("left");
  }

  touchStartX = null;
});

// --- rest of your original code below ---

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
    let top = parseInt(drop.style.top) || 70;
    if (top > gameArea.offsetHeight - 70) {
      clearInterval(fallInterval);
      const wasCaught = checkCatch(drop); 
      if (!wasCaught) {
        showSplash(drop); // 💧 Only splash if not caught
     }

      // Remove this interval from the active list
      activeFallIntervals = activeFallIntervals.filter(obj => obj.interval !== fallInterval);
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
  return caught;
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

  // 🎉 Trigger confetti if the player wins
  if (win) {
    launchConfetti();
  }
}

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
  clearInterval(dropInterval);   // ✅ stop extras first
  clearInterval(gameInterval);   // ✅ stop extras first
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

function launchConfetti() {
  const duration = 2 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// splash function 
function showSplash(drop) {
  const splash = document.createElement("div");
  splash.classList.add("splash");

  if (drop.classList.contains("clean")) {
    splash.classList.add("clean");
  } else {
    splash.classList.add("toxic");
  }

  // Match horizontal position of drop
  splash.style.left = drop.style.left;

  // Position at bottom
  splash.style.top = `${gameArea.offsetHeight - 20}px`;

  gameArea.appendChild(splash);

  // Remove splash after animation
  setTimeout(() => splash.remove(), 400);
}
