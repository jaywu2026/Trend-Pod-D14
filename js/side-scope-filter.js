(function () {
  const futureToggle = document.getElementById("showFutureToggle");
  const scopeBlocks = Array.from(document.querySelectorAll(".psm-scope"));
  if (!scopeBlocks.length) return;

  function applyScopes(selectedScopes) {
    const showLabels = selectedScopes.length > 1;
    scopeBlocks.forEach((el) => {
      el.style.display = selectedScopes.indexOf(el.getAttribute("data-scope")) !== -1 ? "" : "none";
      el.classList.toggle("show-label", showLabels);
    });
    // Smart default: if EVERY selected scope is an individual item, people
    // usually read units/store/week; if any Side/Program total is included,
    // default to $. Only applies on an actual change (see scope-multiselect.js).
    if (window.__applyMetric) {
      const allItems = selectedScopes.length > 0 && selectedScopes.every((s) => s.indexOf("ITEM_") === 0);
      window.__applyMetric(allItems ? "units" : "dollars");
    }
  }
  function applyFutureToggle() {
    document.body.classList.toggle("show-future-months", futureToggle.checked);
  }

  document.addEventListener("scopeschange", (e) => applyScopes(e.detail.scopes));
  if (futureToggle) futureToggle.addEventListener("change", applyFutureToggle);
  applyFutureToggle();
  applyScopes(window.__getSelectedScopes ? window.__getSelectedScopes() : ["SIDE_TOTAL"]);
})();
