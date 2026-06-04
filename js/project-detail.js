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
    src: "assets/works-detail-ririn-1.png",
    alt: "Ririn project page 1",
  },
  {
    src: "assets/works-detail-ririn-2.png",
    alt: "Ririn project page 2",
  },
  {
    src: "assets/works-detail-ririn-3.png",
    alt: "Ririn project page 3",
  },
  {
    src: "assets/works-detail-ririn-4.png",
    alt: "Ririn project page 4",
  },
  {
    src: "assets/works-detail-ririn-5.png",
    alt: "Ririn project page 5",
  },
  {
    src: "assets/works-detail-ririn-6.png",
    alt: "Ririn project page 6",
  },
  {
    src: "assets/works-detail-ririn-7.png",
    alt: "Ririn project page 7",
  },
  {
    src: "assets/works-detail-ririn-8.png",
    alt: "Ririn project page 8",
  },
];

const configuredImages = getConfiguredImages();
const detailImages = configuredImages.length > 0 ? configuredImages : defaultDetailImages;
let currentImageIndex = 0;

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
}

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
