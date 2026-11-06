(function () {
  const agg = window.__STORE_ITEM_AGG__ || [];
  const weeks = window.__STORE_WEEKS__ || {};
  const stores = window.__ALL_CANONICAL_STORES__ || [];
  const items = window.__ITEMS_FOR_FILTER__ || [];
  const sideFilter = document.getElementById("topStoresSideFilter");
  const itemFilter = document.getElementById("topStoresItemFilter");
  const tbody = document.getElementById("topStoresBody");
  if (!tbody) return;
  const instock = window.__STORE_INSTOCK__ || {};
  const scopeBtns = Array.from(document.querySelectorAll(".stores-scope-btn"));
  const exportLink = document.getElementById("storesExport");
  const sub = document.getElementById("topStoresSub");
  let scope = "all"; // "all" = full 481 roster incl. zero-sales stores; "150" = top 150 by sales

  const storeInfoByNumber = new Map(stores.map((s) => [s.store_number, s]));
  const itemsByNumber = new Map(items.map((it) => [it.item_number, it]));

  function computeTopStores(side, itemNumber) {
    const bySt = new Map();
    for (const row of agg) {
      if (itemNumber && row.item_number !== itemNumber) continue;
      if (!itemNumber && side && row.side !== side) continue;
      if (!bySt.has(row.store_number)) bySt.set(row.store_number, { units: 0, sales: 0 });
      const acc = bySt.get(row.store_number);
      acc.units += row.units;
      acc.sales += row.sales;
    }
    const rows = stores.map((info) => {
      const acc = bySt.get(info.store_number) || { units: 0, sales: 0 };
      const w = weeks[info.store_number] || 0;
      const is = instock[info.store_number];
      return {
        store_number: info.store_number, store_name: info.store_name, state: info.state,
        total_units: acc.units, total_sales: acc.sales,
        units_per_week: w ? acc.units / w : null, dollars_per_week: w ? acc.sales / w : null,
        instock: is === undefined ? null : is,
      };
    });
    rows.sort((a, b) => b.total_sales - a.total_sales);
    return scope === "150" ? rows.slice(0, 150) : rows;
  }

  function storeTopItems(storeNumber) {
    return agg.filter((r) => r.store_number === storeNumber)
      .sort((a, b) => b.units - a.units)
      .slice(0, 10)
      .map((r) => ({ ...itemsByNumber.get(r.item_number), units: r.units, sales: r.sales }));
  }

  function render() {
    const side = sideFilter.value ? Number(sideFilter.value) : null;
    const itemNumber = itemFilter.value ? Number(itemFilter.value) : null;
    const rows = computeTopStores(side, itemNumber);
    tbody.innerHTML = "";
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="9" style="color:var(--muted)">No sales recorded yet for this filter.</td></tr>';
      return;
    }
    rows.forEach((s, i) => {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      const isCell = s.instock === null ? "—"
        : `<span class="pill ${s.instock < 80 ? "bad" : s.instock >= 95 ? "ok" : ""}">${s.instock.toFixed(0)}%</span>`;
      tr.innerHTML = `<td class="num">${i+1}</td><td><a href="javascript:void(0)">${s.store_number}</a></td><td>${s.store_name||""}</td><td>${s.state||""}</td>
        <td class="num">$${Math.round(s.total_sales).toLocaleString()}</td><td class="num">${Math.round(s.total_units).toLocaleString()}</td>
        <td class="num">${s.dollars_per_week === null ? "—" : "$" + Math.round(s.dollars_per_week).toLocaleString()}</td><td class="num">${s.units_per_week === null ? "—" : Math.round(s.units_per_week).toLocaleString()}</td>
        <td class="num">${isCell}</td>`;
      tr.addEventListener("click", () => toggleDetail(tr, s.store_number));
      tbody.appendChild(tr);
    });
    if (sub) sub.textContent = (scope === "150" ? "Top 150 stores by total sales, out of the 481-store official roster."
      : "All 481 stores in the official roster, ranked by total sales.") + " Click a store to see its top 10 items.";
    if (exportLink) {
      const base = exportLink.getAttribute("href").split("?")[0];
      const p = [];
      if (itemNumber) p.push("item=" + itemNumber); else if (side) p.push("side=" + side);
      exportLink.setAttribute("href", base + (p.length ? "?" + p.join("&") : ""));
    }
  }
  scopeBtns.forEach((b) => b.addEventListener("click", () => {
    scope = b.getAttribute("data-scope");
    scopeBtns.forEach((x) => x.classList.toggle("active", x === b));
    render();
  }));

  function toggleDetail(tr, storeNumber) {
    const next = tr.nextElementSibling;
    if (next && next.classList.contains("store-detail-row")) { next.remove(); return; }
    Array.from(tbody.querySelectorAll(".store-detail-row")).forEach((r) => r.remove());
    const topItems = storeTopItems(storeNumber);
    const detailRow = document.createElement("tr");
    detailRow.className = "store-detail-row";
    const itemRows = topItems.map((t) => `<tr><td>${t.vendor_stock_id||""}</td><td>${(t.item_description||"").slice(0,45)}</td><td>${t.side||"—"}</td><td class="num">${Number(t.units).toLocaleString()}</td><td class="num">$${Number(t.sales).toLocaleString(undefined,{maximumFractionDigits:0})}</td></tr>`).join("");
    detailRow.innerHTML = `<td></td><td colspan="8">
      <table class="drill-table"><thead><tr><th>Vendor #</th><th>Item</th><th>Side</th><th class="num">Units</th><th class="num">Sales $</th></tr></thead>
      <tbody>${itemRows || '<tr><td colspan="5" style="color:var(--muted)">No sales recorded yet.</td></tr>'}</tbody></table>
    </td>`;
    tr.after(detailRow);
  }

  sideFilter.addEventListener("change", () => {
    const side = sideFilter.value;
    Array.from(itemFilter.options).forEach((opt) => {
      if (!opt.value) { opt.style.display = ""; return; }
      opt.style.display = (!side || opt.getAttribute("data-side") === side) ? "" : "none";
    });
    itemFilter.value = "";
    render();
  });
  itemFilter.addEventListener("change", render);
  render();
})();
