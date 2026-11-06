(function () {
  const sel = document.getElementById("trendItemSelect");
  const el = document.getElementById("trendChart");
  const data = window.__ECOMM_TREND__;
  if (!sel || !el || !data) return;
  let metric = "units";
  const metricBtns = Array.from(document.querySelectorAll(".trend-metric-btn"));

  function seriesMap() { return metric === "sales" ? (data.byItemSales || {}) : data.byItem; }
  function filteredAll() {
    // sum per-item series over items matching the shared Side/Category filter
    const meta = window.__ECOMM_META__ || {};
    const match = window.__ecommMatches || (() => true);
    const out = data.weekColumns.map(() => 0);
    for (const [it, series] of Object.entries(seriesMap())) {
      const m = meta[it] || {};
      if (!match(m.side, m.cat, it)) continue;
      series.forEach((v, i) => { out[i] += Number(v) || 0; });
    }
    return out;
  }
  function render() {
    const val = sel.value;
    const series = val === "ALL" ? filteredAll() : (seriesMap()[val] || data.weekColumns.map(() => 0));
    const points = data.weekColumns.map((w, i) => ({ label: "Wk " + w, value: Number(series[i]) || 0 }));
    drawLineChart(el, points, { color: "#9E3060", prefix: metric === "sales" ? "$" : "" });
  }
  sel.addEventListener("change", render);
  metricBtns.forEach(b => b.addEventListener("click", () => {
    metric = b.getAttribute("data-metric");
    metricBtns.forEach(x => x.classList.toggle("active", x === b));
    render();
  }));
  window.__renderEcommTrend = render;
  render();
})();
