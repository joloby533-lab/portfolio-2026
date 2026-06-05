const menuToggle = document.querySelector(".menu-toggle");
const menuPanel = document.querySelector(".menu-panel");
const stage = document.querySelector(".otherworks-stage");
const cards = Array.from(document.querySelectorAll(".otherworks-card"));
const previousButton = document.querySelector(".otherworks-nav-left");
const nextButton = document.querySelector(".otherworks-nav-right");
const modal = document.querySelector(".otherworks-modal");
const modalVideo = document.querySelector(".otherworks-modal-video");
const modalBackdrop = document.querySelector(".otherworks-modal-backdrop");
const soundToggle = document.querySelector(".otherworks-sound-toggle");
const copyToastTimers = new WeakMap();
const DESIGN_WIDTH = 1728;
const DESIGN_HEIGHT = 959;
let activeCardIndex = 0;

function scaleStage() {
  if (!stage) return;

  const scale = Math.min(window.innerWidth / DESIGN_WIDTH, window.innerHeight / DESIGN_HEIGHT);
  const left = (window.innerWidth - DESIGN_WIDTH * scale) / 2;
  const top = (window.innerHeight - DESIGN_HEIGHT * scale) / 2;

  stage.style.transform = `scale(${scale})`;
  stage.style.left = `${left}px`;
  stage.style.top = `${top}px`;
}

scaleStage();
window.addEventListener("resize", scaleStage);

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

function setMenuOpen(isOpen) {
  if (!menuToggle || !menuPanel) return;

  menuToggle.classList.toggle("is-open", isOpen);
  menuPanel.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

function playCardVideo(card) {
  const video = card.querySelector("video");
  if (!video) return;

  if (!video.src) {
    video.src = card.dataset.videoSrc;
  }
  video.currentTime = 0;
  video.play().catch(() => {});
}

function resetCardVideo(card) {
  const video = card.querySelector("video");
  if (!video) return;

  video.pause();
  video.currentTime = 0;
  video.removeAttribute("src");
  video.load();
}

function openModal(card) {
  if (!modal || !modalVideo) return;

  activeCardIndex = Math.max(0, cards.indexOf(card));
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  setModalMuted(true);
  modalVideo.poster = card.dataset.posterSrc;
  modalVideo.src = card.dataset.videoSrc;
  modalVideo.currentTime = 0;
  modalVideo.play().catch(() => {});
}

function closeModal() {
  if (!modal || !modalVideo) return;

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalVideo.pause();
  setModalMuted(true);
  modalVideo.removeAttribute("src");
  modalVideo.removeAttribute("poster");
  modalVideo.load();
}

function setModalMuted(isMuted) {
  if (!modalVideo || !soundToggle) return;

  modalVideo.muted = isMuted;
  soundToggle.textContent = isMuted ? "sound off" : "sound on";
  soundToggle.setAttribute("aria-pressed", String(!isMuted));
}

function toggleModalSound() {
  if (!modalVideo) return;

  setModalMuted(!modalVideo.muted);
}

function showAdjacentModal(direction) {
  if (cards.length === 0) return;

  const isModalOpen = modal?.classList.contains("is-open");
  const nextIndex = isModalOpen ? (activeCardIndex + direction + cards.length) % cards.length : direction > 0 ? 0 : cards.length - 1;
  openModal(cards[nextIndex]);
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

cards.forEach((card) => {
  card.addEventListener("mouseenter", () => playCardVideo(card));
  card.addEventListener("focus", () => playCardVideo(card));
  card.addEventListener("mouseleave", () => resetCardVideo(card));
  card.addEventListener("blur", () => resetCardVideo(card));
  card.addEventListener("click", () => openModal(card));
});

modalBackdrop?.addEventListener("click", closeModal);
soundToggle?.addEventListener("click", toggleModalSound);
previousButton?.addEventListener("click", () => showAdjacentModal(-1));
nextButton?.addEventListener("click", () => showAdjacentModal(1));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuOpen(false);
    closeModal();
  }

  if (event.key === "ArrowLeft") {
    showAdjacentModal(-1);
  }

  if (event.key === "ArrowRight") {
    showAdjacentModal(1);
  }
});
