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
let activeFallIntervals = [];

// Difficulty settings for each mode
const difficulties = {
  normal: {
    minDrops: 10,
    minPurity: 80,
    toxicChance: 0.2, // 20% green drops
    label: "Normal"
  },
  hard: {
    minDrops: 15,
    minPurity: 90,
    toxicChance: 0.35, // 35% green drops
    label: "Hard"
  },
  expert: {
    minDrops: 20,
    minPurity: 100,
    toxicChance: 0.5, // 50% green drops
    label: "Expert"
  }
};

// Start with normal mode
let currentDifficulty = difficulties.normal;

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

document.getElementById("left-btn").addEventListener("click", () => moveBucket("left"));
document.getElementById("right-btn").addEventListener("click", () => moveBucket("right"));

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    moveBucket("left");
  } else if (e.key === "ArrowRight") {
    moveBucket("right");
  }
});

function moveBucket(direction) {
  const moveAmount = 20;
  const gameAreaRect = gameArea.getBoundingClientRect();
  const bucketRect = bucket.getBoundingClientRect();
  const bucketWidth = bucketRect.width;
  let left = bucket.offsetLeft;

  if (direction === "left") {
    left = Math.max(0, left - moveAmount);
  } else if (direction === "right") {
    left = Math.min(gameAreaRect.width - bucketWidth, left + moveAmount);
  }

  bucket.style.left = `${left}px`;
}

function updateDifficultyLabel() {
  difficultyLabel.textContent = `Mode: ${currentDifficulty.label}`;
}

function startGame() {
  clearInterval(dropInterval);
  clearInterval(gameInterval);

  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  pauseMenu.classList.add("hidden");

  totalDrops = 0;
  cleanDrops = 0;
  secondsLeft = 30;
  updateHUD();
  bucket.style.left = "50%";

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
}

function spawnRaindrop() {
  const drop = document.createElement("div");
  drop.classList.add("raindrop");
  // Use the toxicChance from the current difficulty
  drop.classList.add(Math.random() < (1 - currentDifficulty.toxicChance) ? "clean" : "toxic");
  drop.style.left = `${Math.random() * 90}%`;
  drop.style.top = "70px";

  gameArea.appendChild(drop);

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
  // Use currentDifficulty for win conditions
  const win = purity >= currentDifficulty.minPurity && totalDrops >= currentDifficulty.minDrops;

  resultMessage.textContent = win ? "You Win!" : "Try Again";
  finalStats.textContent = `Final Score: ${totalDrops} drops, Purity: ${purity}% (${currentDifficulty.label} Mode)`;

  if (win) {
    launchConfetti();
  }
}

let resetBtn = document.getElementById("reset-button");
let backBtn = document.getElementById("back-button");

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

let pauseBtn = document.getElementById("pause-button");
let pauseMenu = document.getElementById("pause-menu");
let resumeBtn = document.getElementById("resume-btn");

// Get the pause menu difficulty select and create a button to apply it
const pauseDifficultySelect = document.getElementById("pause-difficulty-select");

pauseBtn.addEventListener("click", () => {
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  pauseAllDrops();
  pauseMenu.classList.remove("hidden");

  // When the pause menu opens, set the select to the current difficulty
  pauseDifficultySelect.value = Object.keys(difficulties).find(
    key => difficulties[key] === currentDifficulty
  );
});

resumeBtn.addEventListener("click", () => {
  pauseMenu.classList.add("hidden");
  resumeGame();
  resumeAllDrops();
});

// When the user changes the difficulty in the pause menu, restart the game with the new difficulty
pauseDifficultySelect.addEventListener("change", (e) => {
  currentDifficulty = difficulties[e.target.value];
  updateDifficultyLabel();
  // Restart the game with the new difficulty
  clearInterval(dropInterval);
  clearInterval(gameInterval);
  document.querySelectorAll(".raindrop").forEach(drop => drop.remove());
  pauseMenu.classList.add("hidden");
  startGame();
});

const difficultySelect = document.getElementById("difficulty-select");

// Get the difficulty label element
let difficultyLabel = document.getElementById("difficulty-label");

// Function to update the difficulty label in the HUD
function updateDifficultyLabel() {
  difficultyLabel.textContent = `Mode: ${currentDifficulty.label}`;
}

// Call this function whenever the difficulty changes or the game starts
function startGame() {
  clearInterval(dropInterval);
  clearInterval(gameInterval);

  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  pauseMenu.classList.add("hidden");

  totalDrops = 0;
  cleanDrops = 0;
  secondsLeft = 30;
  updateHUD();
  bucket.style.left = "50%";

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
}

// When the user changes the difficulty on the start screen
difficultySelect.addEventListener("change", (e) => {
  currentDifficulty = difficulties[e.target.value];
  updateDifficultyLabel();
});