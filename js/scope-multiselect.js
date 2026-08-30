(function () {
  const container = document.getElementById("scopeMultiSelect");
  if (!container) return;
  const btn = document.getElementById("scopeMultiSelectBtn");
  const panel = document.getElementById("scopeMultiSelectPanel");
  const checkboxes = Array.from(container.querySelectorAll(".scope-checkbox"));

  function selected() {
    return checkboxes.filter((c) => c.checked).map((c) => c.value);
  }

  function updateButtonLabel() {
    const vals = selected();
    if (vals.length === 0) {
      // never allow zero selections — fall back to SIDE_TOTAL
      const total = checkboxes.find((c) => c.value === "SIDE_TOTAL");
      if (total) total.checked = true;
      btn.textContent = total ? total.parentElement.textContent.trim() : "Select scope";
      return;
    }
    if (vals.length === 1) {
      const cb = checkboxes.find((c) => c.value === vals[0]);
      btn.textContent = cb ? cb.parentElement.textContent.trim() : vals[0];
    } else {
      btn.textContent = vals.length + " scopes selected";
    }
  }

  function handleCheckboxChange(changedCb) {
    // "Side Total" and individual items are mutually exclusive: picking one
    // or more items clears Side Total, and picking Side Total clears items.
    if (changedCb.value === "SIDE_TOTAL") {
      if (changedCb.checked) {
        checkboxes.forEach((c) => { if (c.value !== "SIDE_TOTAL") c.checked = false; });
      }
    } else if (changedCb.checked) {
      const total = checkboxes.find((c) => c.value === "SIDE_TOTAL");
      if (total) total.checked = false;
    }
    fireChange();
  }

  function fireChange() {
    updateButtonLabel();
    document.dispatchEvent(new CustomEvent("scopeschange", { detail: { scopes: selected() } }));
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) panel.classList.remove("open");
  });
  checkboxes.forEach((cb) => cb.addEventListener("change", () => handleCheckboxChange(cb)));

  // Preselect from ?item=... (set by clicking a SKU in the Summary catalog) —
  // replaces the default selection with just that one item.
  const preselect = window.__PRESELECT_ITEM__;
  if (preselect != null) {
    const targetVal = "ITEM_" + preselect;
    const targetCb = checkboxes.find((c) => c.value === targetVal);
    if (targetCb) {
      checkboxes.forEach((c) => { c.checked = c === targetCb; });
    }
  }

  updateButtonLabel();
  // Initial paint for listeners that mount after this script (chart, top states, $/store table)
  document.dispatchEvent(new CustomEvent("scopeschange", { detail: { scopes: selected() } }));

  // Expose for other scripts that need the current selection synchronously
  window.__getSelectedScopes = selected;
})();
