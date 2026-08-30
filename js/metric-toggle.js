(function () {
  const buttons = Array.from(document.querySelectorAll(".metric-btn"));
  if (!buttons.length) return;

  function apply(metric) {
    document.querySelectorAll(".metric-dollars").forEach((el) => { el.style.display = metric === "dollars" ? "" : "none"; });
    document.querySelectorAll(".metric-units").forEach((el) => { el.style.display = metric === "units" ? "" : "none"; });
    buttons.forEach((b) => b.classList.toggle("active", b.getAttribute("data-metric") === metric));
  }
  buttons.forEach((b) => b.addEventListener("click", () => apply(b.getAttribute("data-metric"))));

  // Exposed so scope-filter.js can smart-default to Units when an individual
  // item is selected (people read item performance in units/store/week) and
  // back to $ for Program/Side totals (people track those in dollars).
  window.__applyMetric = apply;
})();
