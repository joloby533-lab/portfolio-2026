const worksStage = document.querySelector(".works-design-stage");
const worksPage = document.querySelector(".works-page");
const WORKS_DESIGN_WIDTH = 1728;
const WORKS_DESIGN_HEIGHT = 1753;
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

function scaleWorksStage() {
  if (!worksStage || !worksPage) return;

  const scale = window.innerWidth / WORKS_DESIGN_WIDTH;
  const edgeRatio = 1 / scale;

  worksStage.style.transform = `scale(${scale})`;
  worksStage.style.left = "0px";
  worksStage.style.top = "0px";
  worksPage.style.height = `${WORKS_DESIGN_HEIGHT * scale}px`;
  document.documentElement.style.setProperty("--works-stage-scale", scale);
  document.documentElement.style.setProperty("--works-edge-scale-ratio", edgeRatio);
  document.documentElement.style.setProperty("--works-menu-left", `${36 * edgeRatio}px`);
  document.documentElement.style.setProperty("--works-menu-hover-left", `${26 * edgeRatio}px`);
  document.documentElement.style.setProperty("--works-home-small-left", `${98 * edgeRatio}px`);
  document.documentElement.style.setProperty("--works-home-small-hover-left", `${90 * edgeRatio}px`);
  document.documentElement.style.setProperty("--works-menu-panel-left", `${26 * edgeRatio}px`);
  document.documentElement.style.setProperty("--works-title-right", `${40 * edgeRatio}px`);
  document.documentElement.style.setProperty("--works-top-41", `${41 * edgeRatio}px`);
  document.documentElement.style.setProperty("--works-top-33", `${33 * edgeRatio}px`);
  document.documentElement.style.setProperty("--works-top-30", `${30 * edgeRatio}px`);
  document.documentElement.style.setProperty("--works-title-top", `${28 * edgeRatio}px`);
  document.documentElement.style.setProperty("--works-menu-panel-top", `${102 * edgeRatio}px`);
}

setupCopyEmailLinks();
scaleWorksStage();
window.addEventListener("resize", scaleWorksStage);
