(function () {
  const itemSelect = document.getElementById("itemSelect");
  const metricSelect = document.getElementById("metricSelect");
  const allData = window.__STATE_TOTALS_ALL_ITEMS__ || {};

  function refresh() {
    const item = itemSelect.value;
    const metric = metricSelect.value;
    const rows = allData[item] || [];
    const dataByState = {};
    const storeCountByState = {};
    rows.forEach((r) => {
      dataByState[r.state] = Number(r[metric]) || 0;
      storeCountByState[r.state] = Number(r.store_count) || 0;
    });
    const fmt = metric === "sales"
      ? (v) => "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 })
      : (v) => v.toLocaleString();
    window.PHMap.paint(dataByState, fmt, storeCountByState);
  }

  itemSelect.addEventListener("change", refresh);
  metricSelect.addEventListener("change", refresh);
  refresh();
})();
