const worksStage = document.querySelector(".works-design-stage");
const worksPage = document.querySelector(".works-page");
const WORKS_DESIGN_WIDTH = 1728;
const WORKS_DESIGN_HEIGHT = 1753;

function scaleWorksStage() {
  if (!worksStage || !worksPage) return;

  const scale = window.innerWidth / WORKS_DESIGN_WIDTH;

  worksStage.style.transform = `scale(${scale})`;
  worksStage.style.left = "0px";
  worksStage.style.top = "0px";
  worksPage.style.height = `${WORKS_DESIGN_HEIGHT * scale}px`;
  document.documentElement.style.setProperty("--works-stage-scale", scale);
}

scaleWorksStage();
window.addEventListener("resize", scaleWorksStage);
