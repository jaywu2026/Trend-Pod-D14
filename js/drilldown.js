(function () {
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".drill-toggle");
    if (btn) {
      const targetId = btn.getAttribute("data-target");
      const row = document.getElementById(targetId);
      if (!row) return;
      const expanded = btn.getAttribute("aria-expanded") === "true";
      row.style.display = expanded ? "none" : "table-row";
      btn.setAttribute("aria-expanded", expanded ? "false" : "true");
      btn.textContent = expanded ? "▸" : "▾";
      return;
    }
    const all = e.target.closest(".expand-all-btn");
    if (all) {
      const card = all.closest(".card") || document;
      const toggles = Array.from(card.querySelectorAll(".drill-toggle"));
      const expanding = all.textContent.includes("Expand");
      toggles.forEach(t => {
        const row = document.getElementById(t.getAttribute("data-target"));
        if (!row) return;
        row.style.display = expanding ? "table-row" : "none";
        t.setAttribute("aria-expanded", expanding ? "true" : "false");
        t.textContent = expanding ? "▾" : "▸";
      });
      all.textContent = expanding ? "Collapse all weekly data" : "Expand all weekly data";
    }
  });
})();
