const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const stage = document.querySelector(".stage");
const computerFrame = document.querySelector(".computer-frame");
const rippleLayer = document.querySelector(".screen-ripple-layer");
const computerFrames = ["assets/computer-frame-nowater.svg", "assets/computer-frame-nowater2.svg"];
const projectComputerFrames = Array.from({ length: 10 }, (_, index) => {
  const projectNumber = String(index + 1).padStart(2, "0");
  return [`fish-${projectNumber}`, `assets/computer-frame-project${projectNumber}.svg`];
});
const DESIGN_WIDTH = 1728;
const DESIGN_HEIGHT = 959;
const MIN_STAGE_SCALE = 0.66;
const FISH_SWIM_STATE_KEY = "hao-portfolio-fish-swim-state";
const pageAnimationStartedAt = performance.now();
let computerFrameIndex = 0;
let isComputerPreviewActive = false;
let rippleTimer;
const copyToastTimers = new WeakMap();
const computerFrameCache = new Map();

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function preloadComputerFrame(frameSrc) {
  if (computerFrameCache.has(frameSrc)) return computerFrameCache.get(frameSrc);

  const frameImage = new Image();
  frameImage.decoding = "sync";
  frameImage.loading = "eager";
  frameImage.src = frameSrc;
  computerFrameCache.set(frameSrc, frameImage);
  return frameImage;
}

[...computerFrames, ...projectComputerFrames.map(([, frameSrc]) => frameSrc)].forEach(preloadComputerFrame);

function parseCssTimeToMs(value) {
  const text = String(value || "").trim();
  const numeric = Number.parseFloat(text);

  if (!Number.isFinite(numeric)) return 0;
  return text.endsWith("ms") ? numeric : numeric * 1000;
}

function readFishSwimState() {
  try {
    const state = JSON.parse(sessionStorage.getItem(FISH_SWIM_STATE_KEY) || "{}");
    return state && typeof state === "object" ? state : {};
  } catch {
    return {};
  }
}

function getFishSwimProgress(fish) {
  const animation = fish.getAnimations?.({ subtree: false })?.find((item) => item.effect?.getTiming);

  if (animation) {
    const timing = animation.effect.getTiming();
    const duration = typeof timing.duration === "number" ? timing.duration : parseCssTimeToMs(getComputedStyle(fish).animationDuration);
    const currentTime = Number(animation.currentTime);

    if (duration > 0 && Number.isFinite(currentTime)) {
      return (((currentTime % duration) + duration) % duration) / 1000;
    }
  }

  const style = getComputedStyle(fish);
  const duration = parseCssTimeToMs(style.getPropertyValue("--swim-duration") || style.animationDuration);
  const delay = parseCssTimeToMs(style.getPropertyValue("--swim-delay") || style.animationDelay);
  const elapsed = performance.now() - pageAnimationStartedAt;

  if (duration <= 0) return 0;
  return (((elapsed - delay) % duration) + duration) % duration / 1000;
}

function restoreFishSwimProgress(fish, fishId, savedState) {
  const progress = Number(savedState[fishId]);

  if (!Number.isFinite(progress) || progress < 0) return;
  fish.style.setProperty("--swim-delay", `${-progress}s`);
}

function saveFishSwimProgress() {
  const state = {};

  document.querySelectorAll(".fish-card:not(.fish-clone)").forEach((fish) => {
    const fishId = fish.dataset.loopFish;
    if (!fishId) return;

    state[fishId] = getFishSwimProgress(fish);
  });

  try {
    sessionStorage.setItem(FISH_SWIM_STATE_KEY, JSON.stringify(state));
  } catch {
    // If storage is unavailable, the CSS defaults still provide stable first-load positions.
  }
}

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

const savedFishSwimState = readFishSwimState();

document.querySelectorAll(".fish-card").forEach((fish, index) => {
  const fishId = `fish-${index + 1}`;
  const isPulseFish = fish.classList.contains("fish-10");

  fish.dataset.loopFish = fishId;
  restoreFishSwimProgress(fish, fishId, savedFishSwimState);

  const clone = fish.cloneNode(true);
  clone.dataset.loopFish = fishId;
  clone.classList.add("fish-clone");
  clone.setAttribute("aria-hidden", "true");
  clone.tabIndex = -1;
  fish.after(clone);

  const pair = [fish, clone];
  pair.forEach((item) => {
    const image = item.querySelector("img");
    if (!image) return;

    const defaultSrc = image.getAttribute("src");
    const hoverSrc = defaultSrc.replace(/\.png(?:\?.*)?$/, "-hover.png");
    const hoverPreload = new Image();
    hoverPreload.src = hoverSrc;

    image.dataset.defaultSrc = defaultSrc;
    image.dataset.hoverSrc = hoverSrc;

    if (!isPulseFish) {
      for (let dropIndex = 1; dropIndex <= 3; dropIndex += 1) {
        const drop = document.createElement("span");
        drop.className = `fish-water-drop fish-water-drop-${dropIndex}`;
        drop.setAttribute("aria-hidden", "true");
        item.append(drop);
      }
    }
  });

  const setFishHoverActive = (isActive) => {
    pair.forEach((node) => {
      const image = node.querySelector("img");

      node.classList.toggle("is-paused", isActive);
      node.classList.toggle("is-fish-hover", isActive && !isPulseFish);
      node.classList.toggle("is-fish-pulse", isActive && isPulseFish);

      if (image?.dataset.hoverSrc && image.dataset.defaultSrc) {
        image.src = isActive ? image.dataset.hoverSrc : image.dataset.defaultSrc;
      }
    });
  };

  pair.forEach((item) => {
    item.addEventListener("mouseenter", () => setFishHoverActive(true));
    item.addEventListener("focus", () => setFishHoverActive(true));
    item.addEventListener("mouseleave", () => setFishHoverActive(false));
    item.addEventListener("blur", () => setFishHoverActive(false));
  });
});

function showComputerPreview(frameSrc) {
  if (!computerFrame) return;

  isComputerPreviewActive = true;
  computerFrame.src = computerFrameCache.get(frameSrc)?.src || frameSrc;
}

function restoreComputerFrame() {
  if (!computerFrame) return;

  isComputerPreviewActive = false;
  const frameSrc = computerFrames[computerFrameIndex];
  computerFrame.src = computerFrameCache.get(frameSrc)?.src || frameSrc;
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
  const scrollLeft = pageWidth > window.innerWidth ? (pageWidth - window.innerWidth) / 2 : 0;

  document.documentElement.style.setProperty("--home-page-width", `${pageWidth}px`);
  stage.style.transform = `scale(${scale})`;
  stage.style.left = `${left}px`;
  stage.style.top = `${top}px`;
  stage.style.setProperty("--swim-left-edge", "0px");
  stage.style.setProperty("--swim-right-edge", `${DESIGN_WIDTH}px`);

  window.scrollTo({
    left: scrollLeft,
    top: 0,
    behavior: "auto",
  });
}

scaleStage();
window.addEventListener("resize", scaleStage);
window.addEventListener("pageshow", () => {
  scaleStage();
  restoreComputerFrame();
});

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
    const frameSrc = computerFrames[computerFrameIndex];
    computerFrame.src = computerFrameCache.get(frameSrc)?.src || frameSrc;
  }
}, 3800);

function createScreenRipple() {
  if (!rippleLayer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const x = 12 + Math.random() * 76;
  const y = 14 + Math.random() * 72;
  const ringSizes = [18, 34, 52, 72];

  ringSizes.forEach((size, index) => {
    const ring = document.createElement("span");
    ring.className = "screen-ripple";
    ring.style.setProperty("--ripple-x", `${x}%`);
    ring.style.setProperty("--ripple-y", `${y}%`);
    ring.style.setProperty("--ripple-size", `${size}px`);
    ring.style.setProperty("--ripple-alpha", `${0.72 - index * 0.1}`);
    ring.style.animationDelay = `${index * 0.12}s`;
    rippleLayer.append(ring);

    ring.addEventListener("animationend", () => {
      ring.remove();
    });
  });
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
  saveFishSwimProgress();
  window.clearTimeout(rippleTimer);
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveFishSwimProgress();
  }
});
