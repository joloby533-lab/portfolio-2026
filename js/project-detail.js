const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const edgeUi = document.querySelector(".fixed-edge-ui");
const designStage = document.querySelector(".works-detail-stage");
const detailImage = document.querySelector(".works-detail-image");
const detailScroller = document.querySelector(".works-detail-scroll-area");
const previousButton = document.querySelector(".works-detail-nav-left");
const nextButton = document.querySelector(".works-detail-nav-right");
const detailStage = document.querySelector(".works-detail-stage");
const DESIGN_WIDTH = 1728;
const DESIGN_HEIGHT = 959;

if (edgeUi && designStage && edgeUi.parentElement !== designStage) {
  designStage.prepend(edgeUi);
}

function scaleDesignStage() {
  if (!designStage) return;

  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  const left = (window.innerWidth - DESIGN_WIDTH * scale) / 2;
  const top = (window.innerHeight - DESIGN_HEIGHT * scale) / 2;

  designStage.style.transform = `scale(${scale})`;
  designStage.style.left = `${left}px`;
  designStage.style.top = `${top}px`;
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
  preloadAdjacentImages();
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
