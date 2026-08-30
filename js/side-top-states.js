(function () {
  const byScope = window.__TOP_STATES_BY_SCOPE__;
  const tbody = document.getElementById("topStatesBody");
  if (!byScope || !tbody) return;

  function titleCase(s) {
    return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function render(selectedScopes) {
    const combined = new Map();
    (selectedScopes.length ? selectedScopes : ["SIDE_TOTAL"]).forEach((key) => {
      (byScope[key] || []).forEach((s) => {
        combined.set(s.state, (combined.get(s.state) || 0) + (Number(s.units) || 0));
      });
    });
    const rows = Array.from(combined.entries())
      .map(([state, units]) => ({ state, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 8);

    tbody.innerHTML = "";
    rows.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${titleCase(s.state)}</td><td class="num">${Number(s.units).toLocaleString()}</td>`;
      tbody.appendChild(tr);
    });
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="2" style="color:var(--muted)">No sales recorded yet for this scope.</td></tr>';
    }
  }

  document.addEventListener("scopeschange", (e) => render(e.detail.scopes));
  render(window.__getSelectedScopes ? window.__getSelectedScopes() : ["SIDE_TOTAL"]);
})();
