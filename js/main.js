const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const stage = document.querySelector(".stage");
const computerFrame = document.querySelector(".computer-frame");
const computerFrames = ["assets/computer-frame.png", "assets/computer-frame-2.png"];
const stageSize = {
  width: 1728,
  height: 972,
};
let computerFrameIndex = 0;

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

function updateStageScale() {
  const scale = Math.min(window.innerWidth / stageSize.width, window.innerHeight / stageSize.height, 1);
  const stageLeft = (window.innerWidth - stageSize.width * scale) / 2;
  const swimLeftEdge = (0 - stageLeft) / scale;
  const swimRightEdge = (window.innerWidth - stageLeft) / scale;

  stage.style.setProperty("--stage-scale", scale.toFixed(4));
  stage.style.setProperty("--swim-left-edge", `${swimLeftEdge.toFixed(2)}px`);
  stage.style.setProperty("--swim-right-edge", `${swimRightEdge.toFixed(2)}px`);
}

updateStageScale();
window.addEventListener("resize", updateStageScale);

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
