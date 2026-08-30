(function () {
  const buttons = Array.from(document.querySelectorAll(".gran-btn"));
  const views = Array.from(document.querySelectorAll(".gran-view"));
  if (!buttons.length || !views.length) return;

  function apply(gran) {
    views.forEach((v) => { v.style.display = v.getAttribute("data-gran") === gran ? "" : "none"; });
    buttons.forEach((b) => b.classList.toggle("active", b.getAttribute("data-gran") === gran));
  }
  buttons.forEach((b) => b.addEventListener("click", () => apply(b.getAttribute("data-gran"))));
})();
