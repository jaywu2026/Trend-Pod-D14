/* Ad Performance: Export to Excel (current view). Exports whichever channel
 * panel is active, with only the rows currently visible (side/category/search
 * filters, pod-only toggle, and the selected display week all respected,
 * because visibility is read from the live DOM). SheetJS is lazy-loaded on
 * first use so the 860KB bundle never taxes normal page loads. */
(function () {
  const btn = document.getElementById("adsExportBtn");
  if (!btn) return;

  function loadSheetJS() {
    return new Promise((res, rej) => {
      if (window.XLSX) return res();
      const s = document.createElement("script");
      s.src = (window.__HREF__ || "/") + "js/vendor/xlsx.full.min.js";
      s.onload = () => res(); s.onerror = () => rej(new Error("SheetJS load failed"));
      document.head.appendChild(s);
    });
  }

  function cellValue(td) {
    const clone = td.cloneNode(true);
    // drop the small annotation spans (deltas, OOS tags) — keep the main value
    clone.querySelectorAll('span[style*="font-size:10.5px"]').forEach(x => x.remove());
    const raw = clone.textContent.replace(/\s+/g, " ").trim();
    if (/^[-+]?\$?[\d,]+(\.\d+)?$/.test(raw)) return Number(raw.replace(/[$,+]/g, ""));
    return raw;
  }

  function visibleRows(table) {
    return Array.from(table.querySelectorAll("tbody tr")).filter(tr => tr.offsetParent !== null);
  }

  function exportActive() {
    const dispPanel = document.getElementById("adsChDisplay");
    const displayActive = dispPanel && dispPanel.style.display !== "none";
    let table, label;
    if (displayActive) {
      const wk = Array.from(document.querySelectorAll(".display-wk")).find(el => el.offsetParent !== null);
      if (!wk) return alert("No display data to export");
      table = wk.querySelector("table");
      label = "display-" + (wk.getAttribute("data-fw") === "ALL" ? "all-weeks" : "wk" + wk.getAttribute("data-fw"));
    } else {
      table = document.querySelector("#olAds #adsChSearch table");
      label = "sponsored-search";
      if (!table) return alert("No ads data to export");
    }
    const headers = Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.replace(/\s+/g, " ").trim());
    const rows = visibleRows(table).map(tr => Array.from(tr.querySelectorAll("td")).map(cellValue));
    if (!rows.length) return alert("Current view has no visible rows");
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    ws["!cols"] = headers.map((h, i) => ({ wch: Math.max(h.length, ...rows.map(r => String(r[i] ?? "").length)) + 2 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ad Performance");
    const d = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `ad-performance-${label}-${d}.xlsx`);
  }

  btn.addEventListener("click", () => {
    btn.disabled = true; const t = btn.textContent; btn.textContent = "Exporting…";
    loadSheetJS().then(exportActive).catch(e => alert(e.message))
      .finally(() => { btn.disabled = false; btn.textContent = t; });
  });
})();
