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
let pauseBtn = document.getElementById("pause-button");
let pauseMenu = document.getElementById("pause-menu");
let resumeBtn = document.getElementById("resume-btn");
let resetBtn = document.getElementById("reset-button");
let backBtn = document.getElementById("back-button");
let pauseDifficultySelect = document.getElementById("pause-difficulty-select");
let difficultySelect = document.getElementById("difficulty-select");
let difficultyLabel = document.getElementById("difficulty-label");
let gameActive = false; // Track whether the game is currently running
let goalLabel = document.getElementById("goal");


let totalDrops = 0;
let cleanDrops = 0;
let gameInterval;
let dropInterval;
let secondsLeft = 30;
let activeFallIntervals = [];

let currentDifficulty = {
  minDrops: 10,
  minPurity: 80,
  toxicChance: 0.2,
  label: "Normal"
};

const difficulties = {
  normal: { minDrops: 10, minPurity: 80, toxicChance: 0.2, label: "Normal" },
  hard: { minDrops: 15, minPurity: 90, toxicChance: 0.35, label: "Hard" },
  expert: { minDrops: 20, minPurity: 100, toxicChance: 0.5, label: "Expert" }
};

const catchSound = new Audio('audio/splash.wav');
catchSound.volume = 0.4;

const catchToxicSound = new Audio('audio/fart.wav');
catchToxicSound.volume = 0.4;

function addClouds() {
  const cloudRow = document.getElementById("cloud-row");
  cloudRow.innerHTML = "";

  const screenWidth = window.innerWidth;
  let cloudCount = 5;

  if (screenWidth >= 800) {
    cloudCount = 7;
  }
  if (screenWidth >= 1100) {
    cloudCount = 9;
  }

  for (let i = 0; i < cloudCount; i++) {
    const cloud = document.createElement("img");
    cloud.src = "img/cloud2.png";
    cloud.classList.add("cloud");
    cloudRow.appendChild(cloud);
  }
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") moveBucket("left");
  else if (e.key === "ArrowRight") moveBucket("right");
});

function shineBucket(color = "yellow") {
  bucket.style.boxShadow = `0 0 15px 8px ${color}`;
  setTimeout(() => {
    bucket.style.boxShadow = "";
  }, 300);
}

function moveBucket(direction) {
  const moveAmount = 20;
  const gameAreaRect = gameArea.getBoundingClientRect();
  const bucketRect = bucket.getBoundingClientRect();
  const bucketWidth = bucketRect.width;
  let left = bucket.offsetLeft;

  if (direction === "left") {
    left = Math.max(0, left - moveAmount);
  } else if (direction === "right") {
    left = Math.min(gameAreaRect.width - bucketWidth + 50, left + moveAmount);
  }

  bucket.style.left = `${left}px`;
}

function updateHUD() {
  let purity = totalDrops ? Math.round((cleanDrops / totalDrops) * 100) : 100;
  scoreEl.textContent = `Water Collected: ${totalDrops}`;
  purityEl.textContent = `Purity: ${purity}%`;
}

function startGame() {
  clearInterval(dropInterval);
  clearInterval(gameInterval);

  // Disable pause button during countdown
  pauseBtn.disabled = true;

  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  pauseMenu.classList.add("hidden");

  totalDrops = 0;
  cleanDrops = 0;
  secondsLeft = 30;
  updateHUD();
  bucket.style.left = "50%";
  addClouds();

  const countdownOverlay = document.getElementById("countdown-overlay");
  const countdownEl = document.getElementById("countdown");
  countdownOverlay.classList.remove("hidden");
  let count = 3;
  countdownEl.textContent = count;

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownEl.textContent = count;
    } else {
      clearInterval(countdownInterval);
      countdownOverlay.classList.add("hidden");

      // Enable pause button after countdown ends
      pauseBtn.disabled = false;

      document.getElementById("timer-circle").textContent = secondsLeft;
      spawnRaindrop();
      dropInterval = setInterval(spawnRaindrop, 600);
      gameInterval = setInterval(() => {
        secondsLeft--;
        document.getElementById("timer-circle").textContent = secondsLeft;
        if (secondsLeft <= 0) endGame();
      }, 1000);
    }
  }, 1000);

  updateDifficultyLabel();
  updateGoalLabel();
}

function spawnRaindrop() {
  const drop = document.createElement("div");
  drop.classList.add("raindrop");
  drop.classList.add(Math.random() < (1 - currentDifficulty.toxicChance) ? "clean" : "toxic");
  drop.style.left = `${Math.random() * 90}%`;
  drop.style.top = "40px";

  gameArea.appendChild(drop);

  let fallInterval = setInterval(() => {
    let top = parseInt(drop.style.top) || 70;
    if (top > gameArea.offsetHeight - 50) {
      clearInterval(fallInterval);
      const wasCaught = checkCatch(drop);
      if (!wasCaught) showSplash(drop);
      activeFallIntervals = activeFallIntervals.filter(obj => obj.interval !== fallInterval);
      drop.remove();
    } else {
      drop.style.top = `${top + 5}px`;
    }
  }, 30);

  activeFallIntervals.push({ drop, interval: fallInterval });
}

function showSplash(drop) {
  const splash = document.createElement("div");
  splash.classList.add("splash");
  splash.classList.add(drop.classList.contains("clean") ? "clean" : "toxic");
  splash.style.left = drop.style.left;
  splash.style.top = drop.style.top;
  gameArea.appendChild(splash);
  setTimeout(() => splash.remove(), 400);
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
    if (drop.classList.contains("clean")) {
      cleanDrops++;
      catchSound.currentTime = 0;
      catchSound.play();
      shineBucket("yellow");
    } else {
      catchToxicSound.currentTime = 0;
      catchToxicSound.play();
      shineBucket("limegreen");
    }
    updateHUD();
  }

  return caught;
}

function endGame() {
  clearInterval(dropInterval);
  clearInterval(gameInterval);
  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");

  // Disable pause button when game ends
  pauseBtn.disabled = true;

  const purity = totalDrops ? Math.round((cleanDrops / totalDrops) * 100) : 100;
  const win = purity >= currentDifficulty.minPurity && totalDrops >= currentDifficulty.minDrops;

  resultMessage.textContent = win ? "You Win!" : "Try Again";
  finalStats.textContent = `Final Score: ${totalDrops} drops, Purity: ${purity}% (${currentDifficulty.label} Mode)`;

  if (win) launchConfetti();
}

pauseBtn.addEventListener("click", () => {
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  pauseAllDrops();
  pauseMenu.classList.remove("hidden");

  pauseDifficultySelect.value = Object.keys(difficulties).find(
    key => difficulties[key] === currentDifficulty
  );
});

resumeBtn.addEventListener("click", () => {
  pauseMenu.classList.add("hidden");
  resumeGame();
  resumeAllDrops();
});

resetBtn.addEventListener("click", () => {
  clearInterval(dropInterval);
  clearInterval(gameInterval);
  document.querySelectorAll(".raindrop").forEach(drop => drop.remove());
  startGame();
});

backBtn.addEventListener("click", () => {
  clearInterval(dropInterval);
  clearInterval(gameInterval);
  document.querySelectorAll(".raindrop").forEach(drop => drop.remove());
  gameScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
});

pauseDifficultySelect.addEventListener("change", (e) => {
  currentDifficulty = difficulties[e.target.value];
  updateDifficultyLabel();
  clearInterval(dropInterval);
  clearInterval(gameInterval);
  document.querySelectorAll(".raindrop").forEach(drop => drop.remove());
  pauseMenu.classList.add("hidden");
  startGame();
});

difficultySelect.addEventListener("change", (e) => {
  currentDifficulty = difficulties[e.target.value];
  updateDifficultyLabel();
});

function updateDifficultyLabel() {
  difficultyLabel.textContent = `Mode: ${currentDifficulty.label}`;
  updateGoalLabel();
}

function pauseAllDrops() {
  activeFallIntervals.forEach(({ interval }) => clearInterval(interval));
}

function updateGoalLabel() {
  goalLabel.textContent = `Goal: >${currentDifficulty.minPurity}% purity, ${currentDifficulty.minDrops}+ drops`;
}


function resumeAllDrops() {
  const oldDrops = document.querySelectorAll(".raindrop");
  activeFallIntervals = [];
  oldDrops.forEach(drop => {
    let fallInterval = setInterval(() => {
      let top = parseInt(drop.style.top) || 70;
      if (top > gameArea.offsetHeight - 70) {
        clearInterval(fallInterval);
        const wasCaught = checkCatch(drop);
        if (!wasCaught) showSplash(drop);
        activeFallIntervals = activeFallIntervals.filter(obj => obj.interval !== fallInterval);
        drop.remove();
      } else {
        drop.style.top = `${top + 5}px`;
      }
    }, 30);
    activeFallIntervals.push({ drop, interval: fallInterval });
  });
}

function launchConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}

function resumeGame() {
  dropInterval = setInterval(spawnRaindrop, 600);

  gameInterval = setInterval(() => {
    secondsLeft--;
    document.getElementById("timer-circle").textContent = secondsLeft;
    if (secondsLeft <= 0) endGame();
  }, 1000);
}

// === Touch Controls ===
let touchStartX = null;

gameArea.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
});

gameArea.addEventListener("touchend", (e) => {
  if (touchStartX === null) return;
  const touchEndX = e.changedTouches[0].clientX;
  const deltaX = touchEndX - touchStartX;

  if (Math.abs(deltaX) > 30) {
    if (deltaX > 0) moveBucket("right");
    else moveBucket("left");
  }

  touchStartX = null;
});
