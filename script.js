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

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);

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

  // Show 3-second countdown
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

      // ✅ Now start the actual game
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
    left = Math.min(gameAreaRect.width - bucketWidth, left + moveAmount);
  }

  bucket.style.left = `${left}px`;
}


document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    moveBucket("left");
  } else if (e.key === "ArrowRight") {
    moveBucket("right");
  }
});

function spawnRaindrop() {
  const drop = document.createElement("div");
  drop.classList.add("raindrop");
  drop.classList.add(Math.random() < 0.8 ? "clean" : "toxic");

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
  const win = purity >= 80 && totalDrops >= 10;

  resultMessage.textContent = win ? "You Win!" : "Try Again";
  finalStats.textContent = `Final Score: ${totalDrops} drops, Purity: ${purity}%`;

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

pauseBtn.addEventListener("click", () => {
  clearInterval(gameInterval);
  clearInterval(dropInterval);
  pauseAllDrops();
  pauseMenu.classList.remove("hidden");
});

resumeBtn.addEventListener("click", () => {
  pauseMenu.classList.add("hidden");
  resumeGame();
  resumeAllDrops();
});

function resumeGame() {
  clearInterval(dropInterval);
  clearInterval(gameInterval);
  dropInterval = setInterval(spawnRaindrop, 600);
  gameInterval = setInterval(() => {
    secondsLeft--;
    document.getElementById("timer-circle").textContent = secondsLeft;
    if (secondsLeft <= 0) endGame();
  }, 1000);
}

function pauseAllDrops() {
  activeFallIntervals.forEach(obj => {
    clearInterval(obj.interval);
  });
}

function resumeAllDrops() {
  activeFallIntervals.forEach(obj => {
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

function addClouds() {
  const cloudRow = document.getElementById("cloud-row");
  cloudRow.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const cloud = document.createElement("img");
    cloud.src = 'img/cloud2.png';
    cloud.classList.add("cloud");
    cloudRow.appendChild(cloud);
  }
}
addClouds();

function launchConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0 } });
    confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function showSplash(drop) {
  const splash = document.createElement("div");
  splash.classList.add("splash");
  splash.classList.add(drop.classList.contains("clean") ? "clean" : "toxic");
  splash.style.left = drop.style.left;
  splash.style.top = `${gameArea.offsetHeight - 20}px`;
  gameArea.appendChild(splash);
  setTimeout(() => splash.remove(), 400);
}
