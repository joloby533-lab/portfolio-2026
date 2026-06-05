const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const stage = document.querySelector(".stage");
const computerFrame = document.querySelector(".computer-frame");
const rippleLayer = document.querySelector(".screen-ripple-layer");
const computerFrames = ["assets/computer-frame-nowater.svg", "assets/computer-frame-nowater2.svg"];
const projectComputerFrames = Array.from({ length: 9 }, (_, index) => {
  const projectNumber = String(index + 1).padStart(2, "0");
  return [`fish-${projectNumber}`, `assets/computer-frame-project${projectNumber}.svg`];
});
const DESIGN_WIDTH = 1728;
const DESIGN_HEIGHT = 959;
const MIN_STAGE_SCALE = 0.66;
let computerFrameIndex = 0;
let isComputerPreviewActive = false;
let rippleTimer;
const copyToastTimers = new WeakMap();

projectComputerFrames.forEach(([, frameSrc]) => {
  const previewImage = new Image();
  previewImage.src = frameSrc;
});

function copyTextFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function setupCopyEmailLinks() {
  document.querySelectorAll("[data-copy-email]").forEach((link) => {
    link.addEventListener("click", async (event) => {
      event.preventDefault();

      const email = link.dataset.copyEmail || link.textContent.trim();
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(email);
        } else {
          copyTextFallback(email);
        }
      } catch {
        copyTextFallback(email);
      }

      showCopyToast(link);
    });
  });
}

function showCopyToast(link) {
  const footer = link.closest("footer");
  if (!footer) return;

  let toast = footer.querySelector(".copy-toast-icon");
  if (!toast) {
    toast = document.createElement("img");
    toast.className = "copy-toast-icon";
    toast.src = "assets/copy-icon.svg";
    toast.alt = "";
    toast.setAttribute("aria-hidden", "true");
    footer.append(toast);
  }

  window.clearTimeout(copyToastTimers.get(footer));
  requestAnimationFrame(() => toast.classList.add("is-visible"));

  const timer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
  copyToastTimers.set(footer, timer);
}

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

function showComputerPreview(frameSrc) {
  if (!computerFrame) return;

  isComputerPreviewActive = true;
  computerFrame.src = frameSrc;
}

function restoreComputerFrame() {
  if (!computerFrame) return;

  isComputerPreviewActive = false;
  computerFrame.src = computerFrames[computerFrameIndex];
}

projectComputerFrames.forEach(([fishClass, frameSrc]) => {
  document.querySelectorAll(`.${fishClass}`).forEach((fish) => {
    fish.addEventListener("mouseenter", () => showComputerPreview(frameSrc));
    fish.addEventListener("focus", () => showComputerPreview(frameSrc));
    fish.addEventListener("mouseleave", restoreComputerFrame);
    fish.addEventListener("blur", restoreComputerFrame);
  });
});

setupCopyEmailLinks();

function scaleStage() {
  if (!stage) return;

  const fitScale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  const scale = Math.max(MIN_STAGE_SCALE, fitScale);
  const stageWidth = DESIGN_WIDTH * scale;
  const pageWidth = Math.max(window.innerWidth, stageWidth);
  const left = (pageWidth - stageWidth) / 2;
  const top = (window.innerHeight - DESIGN_HEIGHT * scale) / 2;

  document.documentElement.style.setProperty("--home-page-width", `${pageWidth}px`);
  stage.style.transform = `scale(${scale})`;
  stage.style.left = `${left}px`;
  stage.style.top = `${top}px`;
  stage.style.setProperty("--swim-left-edge", "0px");
  stage.style.setProperty("--swim-right-edge", `${DESIGN_WIDTH}px`);

  if (pageWidth > window.innerWidth) {
    requestAnimationFrame(() => {
      window.scrollTo({
        left: (pageWidth - window.innerWidth) / 2,
        top: 0,
        behavior: "auto",
      });
    });
  }
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
  if (!isComputerPreviewActive) {
    computerFrame.src = computerFrames[computerFrameIndex];
  }
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
