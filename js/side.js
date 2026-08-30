(function () {
  const el = document.getElementById("trendChart");
  const byScopeWeek = window.__TREND_BY_SCOPE__;
  const byScopeDay = window.__TREND_BY_SCOPE_DAILY__;
  const granBtns = Array.from(document.querySelectorAll(".trend-gran-btn"));
  const heading = document.getElementById("trendHeading");
  if (!el || !byScopeWeek) return;

  let gran = "day";
  let currentScopes = ["SIDE_TOTAL"];

  function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00Z");
    return (d.getUTCMonth() + 1) + "/" + d.getUTCDate();
  }

  function labelForScope(key) {
    const cb = document.querySelector('.scope-checkbox[value="' + key + '"]');
    return cb ? cb.parentElement.textContent.trim() : key;
  }

  function render() {
    const byScope = gran === "day" && byScopeDay ? byScopeDay : byScopeWeek;
    const series = currentScopes.map((key) => {
      const raw = byScope[key] || [];
      const points = gran === "day" && byScopeDay
        ? raw.map((d) => ({ label: formatDate(d.date), value: Number(d.units) || 0 }))
        : raw.map((d) => ({ label: "Wk " + d.fiscal_week, value: Number(d.units) || 0 }));
      return { label: labelForScope(key), points };
    });
    drawMultiLineChart(el, series);
  }

  document.addEventListener("scopeschange", (e) => {
    currentScopes = e.detail.scopes;
    render();
  });
  if (window.__getSelectedScopes) currentScopes = window.__getSelectedScopes();
  granBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      gran = btn.getAttribute("data-trend-gran");
      granBtns.forEach((b) => b.classList.toggle("active", b === btn));
      if (heading) heading.textContent = gran === "day" ? "Daily Trend" : "Weekly Trend";
      render();
    });
  });
  render();
})();
