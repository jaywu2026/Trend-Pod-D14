(function () {
  const stockoutFilter = document.getElementById("stockoutFilter");
  const perfTabs = Array.from(document.querySelectorAll(".perf-tab"));
  const metricBtns = Array.from(document.querySelectorAll(".var-metric-btn"));
  const table = document.getElementById("varianceTable");
  if (!table || !stockoutFilter || !perfTabs.length) return;
  const tbody = table.querySelector("tbody");

  let currentPerf = "ALL";
  let metric = "units";

  const fmt = (v) => {
    if (v == null || isNaN(v)) return "—";
    return metric === "dollars"
      ? "$" + Math.round(v).toLocaleString()
      : Math.round(v).toLocaleString();
  };

  // Each value cell carries both the unit and dollar figure; we render
  // whichever the toggle asks for rather than keeping two sets of columns.
  function paintCells(scope) {
    scope.querySelectorAll(".vcell").forEach((td) => {
      const raw = td.getAttribute(metric === "dollars" ? "data-d" : "data-u");
      const val = raw === "" || raw == null ? null : parseFloat(raw);
      const suffix = td.getAttribute("data-suffix");
      const bold = td.getAttribute("data-bold") === "1";
      if (val == null || isNaN(val)) {
        td.innerHTML = '<span style="color:var(--muted)">—</span>';
        return;
      }
      const body = bold ? "<strong>" + fmt(val) + "</strong>" : fmt(val);
      td.innerHTML = suffix
        ? body + '<span style="font-size:11px;color:var(--muted)"> ' + suffix + "</span>"
        : body;
    });
  }

  function sumVisible(attrSelectorIndex) {
    let total = 0, any = false;
    visibleRows().forEach((r) => {
      const cells = r.querySelectorAll(".vcell");
      const td = cells[attrSelectorIndex];
      if (!td) return;
      const raw = td.getAttribute(metric === "dollars" ? "data-d" : "data-u");
      if (raw === "" || raw == null) return;
      const v = parseFloat(raw);
      if (isNaN(v)) return;
      total += v; any = true;
    });
    return any ? total : null;
  }

  function visibleRows() {
    return Array.from(tbody.querySelectorAll("tr")).filter((r) => r.style.display !== "none");
  }

  // vcell order per row: 0 WTD, 1 Full-Wk Est, 2 Last Wk, 3 Current Wk Fc, 4 Avg Wk, 5 Next Wk
  function updateTotals() {
    const rows = visibleRows();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = fmt(val); };

    const totWtd = sumVisible(0);
    const totFwe = sumVisible(1);
    const totLast = sumVisible(2);
    const totCwFc = sumVisible(3);
    const totAvgWk = sumVisible(4);
    const totNextWk = sumVisible(5);

    set("totWtd", totWtd);
    set("totFwe", totFwe);
    set("totLastWk", totLast);
    set("totCwFc", totCwFc);
    set("totAvgWk", totAvgWk);
    set("totNextWk", totNextWk);

    const countEl = document.getElementById("varTotalCount");
    if (countEl) countEl.textContent = "(" + rows.length + " SKU" + (rows.length === 1 ? "" : "s") + ")";

    // Variance on the TOTAL row is computed from the summed figures, not by
    // averaging the per-item percentages — averaging would let a tiny SKU
    // swing the program number as much as a top seller.
    const varEl = document.getElementById("totVariance");
    if (varEl) {
      if (totFwe != null && totCwFc != null && totCwFc !== 0) {
        const v = ((totFwe - totCwFc) / totCwFc) * 100;
        const cls = v >= -10 ? "good" : v >= -30 ? "flat" : "bad";
        varEl.innerHTML = '<span class="pill ' + cls + '">' + (v > 0 ? "+" : "") + v.toFixed(0) + "%</span>";
      } else varEl.textContent = "—";
    }

    const soEl = document.getElementById("totStockout");
    if (soEl) {
      const atRisk = rows.filter((r) => r.getAttribute("data-stockout") === "RISK").length;
      soEl.innerHTML = atRisk
        ? '<span class="pill bad">' + atRisk + " at risk</span>"
        : '<span class="pill good">None at risk</span>';
    }
  }

  function apply() {
    const stockout = stockoutFilter.value;
    const rows = Array.from(tbody.querySelectorAll("tr"));

    // Sort: ALL -> by $ (desc); OVER -> best-to-worst (variance desc);
    // UNDER -> worst-to-best (variance asc).
    const byAttr = (attr, dir) => (a, b) => {
      const va = parseFloat(a.getAttribute(attr)), vb = parseFloat(b.getAttribute(attr));
      if (isNaN(va) && isNaN(vb)) return 0;
      if (isNaN(va)) return 1;
      if (isNaN(vb)) return -1;
      return dir === "desc" ? vb - va : va - vb;
    };
    let sorted;
    if (currentPerf === "OVER") sorted = rows.slice().sort(byAttr("data-variance", "desc"));
    else if (currentPerf === "UNDER") sorted = rows.slice().sort(byAttr("data-variance", "asc"));
    else sorted = rows.slice().sort(byAttr("data-dollars", "desc"));
    sorted.forEach((r) => tbody.appendChild(r));

    sorted.forEach((r) => {
      const matchesStockout = stockout === "ALL" || r.getAttribute("data-stockout") === stockout;
      const matchesPerf = currentPerf === "ALL" || r.getAttribute("data-perf") === currentPerf;
      r.style.display = matchesStockout && matchesPerf ? "" : "none";
    });

    updateTotals();
  }

  stockoutFilter.addEventListener("change", apply);
  perfTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPerf = btn.getAttribute("data-perf-tab");
      perfTabs.forEach((b) => b.classList.toggle("active", b === btn));
      apply();
    });
  });
  metricBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      metric = btn.getAttribute("data-var-metric");
      metricBtns.forEach((b) => b.classList.toggle("active", b === btn));
      paintCells(table);
      updateTotals();
    });
  });

  paintCells(table);
  apply();
})();
