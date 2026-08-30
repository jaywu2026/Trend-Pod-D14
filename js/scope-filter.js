(function () {
  const scopeSelect = document.getElementById("scopeSelect");
  const futureToggle = document.getElementById("showFutureToggle");
  if (!scopeSelect) return;
  const scopeBlocks = Array.from(document.querySelectorAll(".psm-scope"));

  function applyScope() {
    const val = scopeSelect.value;
    scopeBlocks.forEach((el) => {
      el.style.display = el.getAttribute("data-scope") === val ? "" : "none";
    });
    // Smart default: item-level detail is usually read in units/store/week;
    // Program/Side totals are usually read in $. Only auto-switch on an
    // actual scope change, not on first load (handled separately below).
    if (window.__applyMetric) {
      window.__applyMetric(val.indexOf("ITEM_") === 0 ? "units" : "dollars");
    }
  }
  function applyFutureToggle() {
    document.body.classList.toggle("show-future-months", futureToggle.checked);
  }

  scopeSelect.addEventListener("change", applyScope);
  if (futureToggle) futureToggle.addEventListener("change", applyFutureToggle);

  const preselect = window.__PRESELECT_ITEM__;
  if (preselect != null) {
    const val = "ITEM_" + preselect;
    if (Array.from(scopeSelect.options).some((o) => o.value === val)) {
      scopeSelect.value = val;
      scopeSelect.dispatchEvent(new Event("change"));
    }
  }
  applyScope();
  applyFutureToggle();
})();
