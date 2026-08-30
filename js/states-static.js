(function () {
  const data = window.__STATES_DATA__ || {};
  const stateNames = Object.keys(data).sort();
  const stateSelect = document.getElementById("stateSelect");
  const storeSearch = document.getElementById("storeSearch");
  const stateHeader = document.getElementById("stateHeader");
  const storesBody = document.getElementById("storesBody");
  const topItemsBody = document.getElementById("topItemsBody");
  const topItemsStateLabel = document.getElementById("topItemsStateLabel");

  function titleCase(s) {
    return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  stateNames.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = `${titleCase(name)} (${data[name].stores.length} stores)`;
    stateSelect.appendChild(opt);
  });

  function renderStores(filterText) {
    const state = stateSelect.value;
    const entry = data[state];
    if (!entry) return;
    const q = (filterText || "").trim().toUpperCase();
    storesBody.innerHTML = "";
    entry.stores.forEach((s) => {
      if (q && !(String(s.store_number).includes(q) || (s.store_name || "").toUpperCase().includes(q))) return;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${s.store_number}</td><td>${s.store_name || ""}</td><td class="num">${s.products_on_hand} / 36</td><td class="num">${s.products_selling} / 36</td>`;
      storesBody.appendChild(tr);
    });
    if (!storesBody.children.length) {
      storesBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">No matching stores.</td></tr>';
    }
  }

  function renderTopItems() {
    const state = stateSelect.value;
    const entry = data[state];
    if (!entry) return;
    topItemsStateLabel.textContent = "in " + titleCase(state);
    topItemsBody.innerHTML = "";
    entry.topItems.forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${t.vendor_stock_id || ""}</td><td>${(t.item_description || "").slice(0,55)}</td><td>${t.side || "—"}</td><td class="num">${Number(t.units).toLocaleString()}</td><td class="num">$${Number(t.sales).toLocaleString(undefined,{maximumFractionDigits:0})}</td>`;
      topItemsBody.appendChild(tr);
    });
    if (!topItemsBody.children.length) {
      topItemsBody.innerHTML = '<tr><td colspan="5" style="color:var(--muted)">No sales recorded yet for this state.</td></tr>';
    }
  }

  function renderAll() {
    const state = stateSelect.value;
    stateHeader.textContent = titleCase(state) + " — " + (data[state] ? data[state].stores.length : 0) + " official-roster stores";
    renderStores(storeSearch.value);
    renderTopItems();
  }

  stateSelect.addEventListener("change", renderAll);
  storeSearch.addEventListener("input", () => renderStores(storeSearch.value));

  // Preselect from ?state=XXXX (set by clicking the map on the Summary page)
  const m = /(?:^|[?&])state=([^&]+)/.exec(window.location.search);
  const preselect = m ? decodeURIComponent(m[1]).toUpperCase() : null;
  if (preselect && data[preselect]) stateSelect.value = preselect;
  else if (stateNames.length) stateSelect.value = stateNames[0];

  renderAll();
})();
