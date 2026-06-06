const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const detailImage = document.querySelector(".works-detail-image");
const detailScroller = document.querySelector(".works-detail-scroll-area");
const previousButton = document.querySelector(".works-detail-nav-left");
const nextButton = document.querySelector(".works-detail-nav-right");
const detailStage = document.querySelector(".works-detail-stage");
const detailFrameWrap = document.querySelector(".works-detail-frame-wrap");
const projectDetailPage = document.querySelector(".project-detail-page");
const closeButton = document.querySelector(".works-detail-close");
const DESIGN_WIDTH = 1728;
const DESIGN_HEIGHT = 959;

if (closeButton && projectDetailPage && closeButton.parentElement !== projectDetailPage) {
  projectDetailPage.append(closeButton);
}

function scaleDesignStage() {
  if (!detailStage) return;

  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  const left = (window.innerWidth - DESIGN_WIDTH * scale) / 2;
  const top = (window.innerHeight - DESIGN_HEIGHT * scale) / 2;

  detailStage.style.transform = `scale(${scale})`;
  detailStage.style.left = `${left}px`;
  detailStage.style.top = `${top}px`;
}

scaleDesignStage();
window.addEventListener("resize", scaleDesignStage);

function getConfiguredImages() {
  if (!detailStage?.dataset.images) return [];

  const projectTitle = detailStage.dataset.projectTitle || "Project";
  return detailStage.dataset.images
    .split(",")
    .map((src) => src.trim())
    .filter(Boolean)
    .map((src, index) => ({
      src,
      alt: `${projectTitle} page ${index + 1}`,
    }));
}

const defaultDetailImages = [
  {
    src: "assets/optimized/works-detail-ririn-1.webp",
    alt: "Ririn project page 1",
  },
  {
    src: "assets/optimized/works-detail-ririn-2.webp",
    alt: "Ririn project page 2",
  },
  {
    src: "assets/optimized/works-detail-ririn-3.webp",
    alt: "Ririn project page 3",
  },
  {
    src: "assets/optimized/works-detail-ririn-4.webp",
    alt: "Ririn project page 4",
  },
  {
    src: "assets/optimized/works-detail-ririn-5.webp",
    alt: "Ririn project page 5",
  },
  {
    src: "assets/optimized/works-detail-ririn-6.webp",
    alt: "Ririn project page 6",
  },
  {
    src: "assets/optimized/works-detail-ririn-7.webp",
    alt: "Ririn project page 7",
  },
  {
    src: "assets/optimized/works-detail-ririn-8.webp",
    alt: "Ririn project page 8",
  },
];

const configuredImages = getConfiguredImages();
const detailImages = configuredImages.length > 0 ? configuredImages : defaultDetailImages;
let currentImageIndex = 0;
let adjacentPreloaders = [];
let progressDots = [];
let scrollHint;
const copyToastTimers = new WeakMap();

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

function setMenuOpen(isOpen) {
  if (!menuToggle || !menuPanel) return;

  menuToggle.classList.toggle("is-open", isOpen);
  menuPanel.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

function showProjectImage(nextIndex) {
  if (!detailImage || !detailScroller) return;

  currentImageIndex = (nextIndex + detailImages.length) % detailImages.length;
  detailImage.src = detailImages[currentImageIndex].src;
  detailImage.alt = detailImages[currentImageIndex].alt;
  detailScroller.scrollTop = 0;
  updateProgressIndicators();
  updateScrollHint();
  requestAnimationFrame(updateScrollHint);
  preloadAdjacentImages();
}

function setupScrollHint() {
  if (!detailFrameWrap || !detailScroller) return;

  scrollHint = document.createElement("span");
  scrollHint.className = "works-detail-scroll-hint";
  scrollHint.setAttribute("aria-hidden", "true");
  detailFrameWrap.append(scrollHint);

  detailScroller.addEventListener("scroll", updateScrollHint, { passive: true });
  detailImage?.addEventListener("load", updateScrollHint);
  window.addEventListener("resize", updateScrollHint);
  requestAnimationFrame(updateScrollHint);
}

function updateScrollHint() {
  if (!scrollHint || !detailScroller) return;

  const canScrollDown = detailScroller.scrollHeight - detailScroller.clientHeight > 8;
  const nearTop = detailScroller.scrollTop < 18;
  scrollHint.classList.toggle("is-visible", canScrollDown && nearTop);
}

function setupProgressIndicators() {
  if (!detailStage || detailImages.length <= 1) return;

  const progress = document.createElement("div");
  progress.className = "works-detail-progress";
  progress.setAttribute("aria-hidden", "true");

  progressDots = detailImages.map((_, index) => {
    const dot = document.createElement("span");
    dot.className = "works-detail-progress-dot";
    dot.classList.toggle("is-active", index === currentImageIndex);
    progress.append(dot);
    return dot;
  });

  detailStage.append(progress);
}

function updateProgressIndicators() {
  progressDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === currentImageIndex);
  });
}

function preloadAdjacentImages() {
  if (detailImages.length <= 1) return;

  const previousIndex = (currentImageIndex - 1 + detailImages.length) % detailImages.length;
  const nextIndex = (currentImageIndex + 1) % detailImages.length;

  adjacentPreloaders = [previousIndex, nextIndex].map((index) => {
    const image = new Image();
    image.decoding = "async";
    image.src = detailImages[index].src;
    return image;
  });
}

setupCopyEmailLinks();
setupScrollHint();
setupProgressIndicators();

if (menuToggle && menuPanel) {
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
}

if (previousButton && nextButton) {
  previousButton.addEventListener("click", () => {
    showProjectImage(currentImageIndex - 1);
  });

  nextButton.addEventListener("click", () => {
    showProjectImage(currentImageIndex + 1);
  });
}

preloadAdjacentImages();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
  }

  if (event.key === "ArrowLeft") {
    showProjectImage(currentImageIndex - 1);
  }

  if (event.key === "ArrowRight") {
    showProjectImage(currentImageIndex + 1);
  }
});
