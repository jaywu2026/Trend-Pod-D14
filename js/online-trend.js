(function () {
  const sel = document.getElementById("trendItemSelect");
  const el = document.getElementById("trendChart");
  const data = window.__ECOMM_TREND__;
  if (!sel || !el || !data) return;

  function render() {
    const val = sel.value;
    const series = val === "ALL" ? data.all : (data.byItem[val] || data.weekColumns.map(() => 0));
    const points = data.weekColumns.map((w, i) => ({ label: "Wk " + w, value: Number(series[i]) || 0 }));
    drawLineChart(el, points, { color: "#9E3060" });
  }
  sel.addEventListener("change", render);
  render();
})();
