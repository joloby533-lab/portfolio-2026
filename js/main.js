const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const stage = document.querySelector(".stage");
const computerFrame = document.querySelector(".computer-frame");
const rippleLayer = document.querySelector(".screen-ripple-layer");
const computerFrames = ["assets/computer-frame-nowater.svg", "assets/computer-frame-nowater2.svg"];
const DESIGN_WIDTH = 1728;
const DESIGN_HEIGHT = 959;
let computerFrameIndex = 0;
let rippleTimer;

document.querySelectorAll(".fish-card").forEach((fish, index) => {
  const clone = fish.cloneNode(true);
  const fishId = `fish-${index + 1}`;

  fish.dataset.loopFish = fishId;
  clone.dataset.loopFish = fishId;
  clone.classList.add("fish-clone");
  clone.setAttribute("aria-hidden", "true");
  clone.tabIndex = -1;
  fish.after(clone);

  const pair = [fish, clone];
  pair.forEach((item) => {
    item.addEventListener("mouseenter", () => pair.forEach((node) => node.classList.add("is-paused")));
    item.addEventListener("mouseleave", () => pair.forEach((node) => node.classList.remove("is-paused")));
  });
});

function scaleStage() {
  if (!stage) return;

  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  const left = (window.innerWidth - DESIGN_WIDTH * scale) / 2;
  const top = (window.innerHeight - DESIGN_HEIGHT * scale) / 2;

  stage.style.transform = `scale(${scale})`;
  stage.style.left = `${left}px`;
  stage.style.top = `${top}px`;
  stage.style.setProperty("--swim-left-edge", "0px");
  stage.style.setProperty("--swim-right-edge", `${DESIGN_WIDTH}px`);
}

scaleStage();
window.addEventListener("resize", scaleStage);

function setMenuOpen(isOpen) {
  menuToggle.classList.toggle("is-open", isOpen);
  menuPanel.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

menuToggle.addEventListener("click", (event) => {
  event.stopPropagation();
  setMenuOpen(!menuPanel.classList.contains("is-open"));
});

menuPanel.addEventListener("click", (event) => {
  event.stopPropagation();
});

document.addEventListener("click", () => {
  setMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
  }
});

setInterval(() => {
  computerFrameIndex = (computerFrameIndex + 1) % computerFrames.length;
  computerFrame.src = computerFrames[computerFrameIndex];
}, 3800);

function createScreenRipple() {
  if (!rippleLayer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const x = 12 + Math.random() * 76;
  const y = 14 + Math.random() * 72;
  const ringCount = 2;

  for (let index = 0; index < ringCount; index += 1) {
    const ring = document.createElement("span");
    ring.className = "screen-ripple";
    ring.style.setProperty("--ripple-x", `${x}%`);
    ring.style.setProperty("--ripple-y", `${y}%`);
    ring.style.animationDelay = `${index * 0.24}s`;
    rippleLayer.append(ring);

    ring.addEventListener("animationend", () => {
      ring.remove();
    });
  }
}

function scheduleScreenRipple() {
  const nextDelay = 700 + Math.random() * 1300;

  rippleTimer = window.setTimeout(() => {
    createScreenRipple();
    scheduleScreenRipple();
  }, nextDelay);
}

createScreenRipple();
window.setTimeout(createScreenRipple, 420);
window.setTimeout(createScreenRipple, 980);
scheduleScreenRipple();

window.addEventListener("pagehide", () => {
  window.clearTimeout(rippleTimer);
});
