const btn = document.getElementById("enterBtn");

  btn.addEventListener("click", () => {
  document.getElementById("topHalf").classList.add("open");
  document.getElementById("bottomHalf").classList.add("open");
  btn.classList.add("pulse");

  setTimeout(() => {
    btn.classList.add("fadeout");
    }, 300);

  setTimeout(() => {
    window.location.href = "index.html";
    }, 1200);
});