(function () {
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".drill-toggle");
    if (!btn) return;
    const targetId = btn.getAttribute("data-target");
    const row = document.getElementById(targetId);
    if (!row) return;
    const expanded = btn.getAttribute("aria-expanded") === "true";
    row.style.display = expanded ? "none" : "table-row";
    btn.setAttribute("aria-expanded", expanded ? "false" : "true");
    btn.textContent = expanded ? "▸" : "▾";
  });
})();
