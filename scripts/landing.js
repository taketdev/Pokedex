const btn = document.getElementById("enterBtn");

btn.addEventListener("click", () => {
  document.getElementById("topHalf").classList.add("open");
  document.getElementById("bottomHalf").classList.add("open");
  btn.classList.add("pulse");

setTimeout(() => {
  btn.classList.add("fadeout");
}, 300);

setTimeout(() => {
  const landing = document.getElementById("landingContainer");
  landing.parentNode.removeChild(landing);

  const app = document.getElementById("appContent");
  app.classList.remove("d_none");

  if (typeof loadMore === "function") {
    loadMore();
  } else {
    console.warn("loadMore() ist noch nicht definiert.");
  }
}, 1200);
});