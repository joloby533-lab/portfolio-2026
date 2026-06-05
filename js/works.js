const worksStage = document.querySelector(".works-design-stage");
const worksPage = document.querySelector(".works-page");
const WORKS_DESIGN_HEIGHT = 2027;
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

function setWorksPageHeight() {
  if (!worksStage || !worksPage) return;

  worksStage.style.left = "0px";
  worksStage.style.top = "0px";
  worksPage.style.height = `${WORKS_DESIGN_HEIGHT}px`;
}

function updateWorksScrolledState() {
  document.body.classList.toggle("is-works-scrolled", window.scrollY > 24);
}

setupCopyEmailLinks();
setWorksPageHeight();
updateWorksScrolledState();
window.addEventListener("scroll", updateWorksScrolledState, { passive: true });
