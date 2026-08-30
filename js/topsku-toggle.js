(function () {
  const windowBtns = Array.from(document.querySelectorAll(".window-btn"));
  const sortBtns = Array.from(document.querySelectorAll(".topsort-btn"));
  const views = Array.from(document.querySelectorAll(".topsku-view"));
  if (!views.length) return;

  let currentWindow = "total";
  let currentSort = "units";

  function apply() {
    views.forEach((v) => {
      v.style.display = (v.getAttribute("data-window") === currentWindow && v.getAttribute("data-sort") === currentSort) ? "" : "none";
    });
    windowBtns.forEach((b) => b.classList.toggle("active", b.getAttribute("data-window") === currentWindow));
    sortBtns.forEach((b) => b.classList.toggle("active", b.getAttribute("data-sort") === currentSort));
  }
  windowBtns.forEach((b) => b.addEventListener("click", () => { currentWindow = b.getAttribute("data-window"); apply(); }));
  sortBtns.forEach((b) => b.addEventListener("click", () => { currentSort = b.getAttribute("data-sort"); apply(); }));
})();
