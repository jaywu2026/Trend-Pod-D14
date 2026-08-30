(function () {
  const agg = window.__STORE_ITEM_AGG__ || [];
  const weeks = window.__STORE_WEEKS__ || {};
  const stores = window.__ALL_CANONICAL_STORES__ || [];
  const items = window.__ITEMS_FOR_FILTER__ || [];
  const sideFilter = document.getElementById("topStatesSideFilter");
  const itemFilter = document.getElementById("topStatesItemFilter");
  const tbody = document.getElementById("topStatesBody");
  if (!tbody) return;

  const storeInfoByNumber = new Map(stores.map((s) => [s.store_number, s]));
  const storeStateByNumber = new Map(stores.map((s) => [s.store_number, s.state]));

  function titleCase(s) { return (s||"").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()); }

  function filteredAgg(side, itemNumber) {
    return agg.filter((row) => {
      if (itemNumber) return row.item_number === itemNumber;
      if (side) return row.side === side;
      return true;
    });
  }

  function computeTopStates(side, itemNumber) {
    const rows = filteredAgg(side, itemNumber);
    const byState = new Map();
    const sellingStoresByState = new Map();
    for (const row of rows) {
      const state = storeStateByNumber.get(row.store_number);
      if (!state) continue;
      if (!byState.has(state)) { byState.set(state, { units: 0, sales: 0 }); sellingStoresByState.set(state, new Set()); }
      const acc = byState.get(state);
      acc.units += row.units; acc.sales += row.sales;
      sellingStoresByState.get(state).add(row.store_number);
    }
    const out = Array.from(byState.entries()).map(([state, acc]) => {
      // average weeks across selling stores in this state (usually all =1 right now)
      const storeNums = Array.from(sellingStoresByState.get(state));
      const w = storeNums.length ? storeNums.reduce((a, sn) => a + (weeks[sn] || 1), 0) / storeNums.length : 1;
      return {
        state, n_selling_stores: storeNums.length,
        total_units: acc.units, total_sales: acc.sales,
        units_per_week: acc.units / w, dollars_per_week: acc.sales / w,
      };
    });
    out.sort((a, b) => b.total_sales - a.total_sales);
    return out;
  }

  function computeStateStores(state, side, itemNumber) {
    const rows = filteredAgg(side, itemNumber).filter((row) => storeStateByNumber.get(row.store_number) === state);
    const byStore = new Map();
    for (const row of rows) {
      if (!byStore.has(row.store_number)) byStore.set(row.store_number, { units: 0, sales: 0 });
      const acc = byStore.get(row.store_number);
      acc.units += row.units; acc.sales += row.sales;
    }
    const out = Array.from(byStore.entries()).map(([storeNumber, acc]) => {
      const info = storeInfoByNumber.get(storeNumber) || {};
      const w = weeks[storeNumber] || 1;
      return { store_number: storeNumber, store_name: info.store_name, total_units: acc.units, total_sales: acc.sales, units_per_week: acc.units/w, dollars_per_week: acc.sales/w };
    });
    out.sort((a, b) => b.total_sales - a.total_sales);
    return out;
  }

  function renderStates() {
    const side = sideFilter.value ? Number(sideFilter.value) : null;
    const itemNumber = itemFilter.value ? Number(itemFilter.value) : null;
    const rows = computeTopStates(side, itemNumber);
    tbody.innerHTML = "";
    document.getElementById("stateStoresCard").style.display = "none";
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="color:var(--muted)">No sales recorded yet for this filter.</td></tr>';
      return;
    }
    rows.forEach((s, i) => {
      const tr = document.createElement("tr");
      tr.style.cursor = "pointer";
      tr.innerHTML = `<td class="num">${i+1}</td><td><a href="javascript:void(0)">${titleCase(s.state)}</a></td><td class="num">${s.n_selling_stores}</td>
        <td class="num">$${Math.round(s.total_sales).toLocaleString()}</td><td class="num">${Math.round(s.total_units).toLocaleString()}</td>
        <td class="num">$${Math.round(s.dollars_per_week).toLocaleString()}</td><td class="num">${Math.round(s.units_per_week).toLocaleString()}</td>`;
      tr.addEventListener("click", () => renderStateStores(s.state, side, itemNumber));
      tbody.appendChild(tr);
    });
  }

  function renderStateStores(state, side, itemNumber) {
    const card = document.getElementById("stateStoresCard");
    const heading = document.getElementById("stateStoresHeading");
    const storesBody = document.getElementById("stateStoresBody");
    heading.textContent = "Stores in " + titleCase(state) + " — sorted by Total Sales";
    const rows = computeStateStores(state, side, itemNumber);
    storesBody.innerHTML = "";
    rows.forEach((s) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${s.store_number}</td><td>${s.store_name||""}</td><td class="num">$${Math.round(s.total_sales).toLocaleString()}</td>
        <td class="num">${Math.round(s.total_units).toLocaleString()}</td><td class="num">$${Math.round(s.dollars_per_week).toLocaleString()}</td>
        <td class="num">${Math.round(s.units_per_week).toLocaleString()}</td>`;
      storesBody.appendChild(tr);
    });
    if (!rows.length) storesBody.innerHTML = '<tr><td colspan="6" style="color:var(--muted)">No stores with sales for this filter.</td></tr>';
    card.style.display = "";
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  sideFilter.addEventListener("change", () => {
    const side = sideFilter.value;
    Array.from(itemFilter.options).forEach((opt) => {
      if (!opt.value) { opt.style.display = ""; return; }
      opt.style.display = (!side || opt.getAttribute("data-side") === side) ? "" : "none";
    });
    itemFilter.value = "";
    renderStates();
  });
  itemFilter.addEventListener("change", renderStates);
  renderStates();
})();
