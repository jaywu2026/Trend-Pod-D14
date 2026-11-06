/* Shared filters (Side/Item multiselect + Category multiselect + search):
 * drive the SKU Detail tables, FC Inventory, Ad Performance rows/KPIs, the
 * trend item dropdowns and the trend charts' aggregates (via re-render). */
(function () {
  const search = document.getElementById("skuSearch");
  const trendSel = document.getElementById("trendItemSelect");
  const tables = Array.from(document.querySelectorAll(".ecomm-table"));

  function setupMs(rootId, btnId, panelId, cbClass, allLabel, onChange) {
    const root = document.getElementById(rootId);
    if (!root) return { selected: () => ({ all: true }) };
    const btn = document.getElementById(btnId), panel = document.getElementById(panelId);
    const cbs = Array.from(root.querySelectorAll("." + cbClass));
    const all = cbs.find(c => c.value === "ALL");
    function label() {
      const picked = cbs.filter(c => c.checked && c.value !== "ALL");
      if (!picked.length || (all && all.checked)) { if (all) all.checked = true; btn.textContent = allLabel; return; }
      btn.textContent = picked.length === 1 ? picked[0].parentElement.textContent.trim().slice(0, 42) : picked.length + " selected";
    }
    cbs.forEach(cb => cb.addEventListener("change", () => {
      if (cb.value === "ALL") { if (cb.checked) cbs.forEach(c => { if (c !== cb) c.checked = false; }); }
      else if (cb.checked && all) {
        all.checked = false;
        // ticking a side clears that side's individual items (side already covers them)
        if (cb.getAttribute("data-kind") === "side")
          cbs.forEach(c => { if (c.getAttribute("data-kind") === "item" && c.getAttribute("data-side") === cb.value) c.checked = false; });
      }
      label(); onChange();
    }));
    btn.addEventListener("click", e => { e.stopPropagation(); panel.classList.toggle("open"); });
    document.addEventListener("click", e => { if (!root.contains(e.target)) panel.classList.remove("open"); });
    label();
    return {
      selected: () => {
        if (!all || all.checked) return { all: true };
        return {
          all: false,
          sides: new Set(cbs.filter(c => c.checked && c.getAttribute("data-kind") === "side").map(c => c.value)),
          items: new Set(cbs.filter(c => c.checked && c.getAttribute("data-kind") === "item").map(c => c.value)),
          vals: new Set(cbs.filter(c => c.checked && c.value !== "ALL").map(c => c.value)),
        };
      },
    };
  }

  let sideMs, catMs;
  window.__ECOMM_FILTER__ = { all: true };

  // matches(side, cat, item) — item optional; used by every consumer on the page
  function matches(sideVal, catVal, itemVal) {
    const sf = sideMs ? sideMs.selected() : { all: true };
    const cf = catMs ? catMs.selected() : { all: true };
    const okSide = sf.all
      || sf.sides.has(String(sideVal))
      || (itemVal !== undefined && itemVal !== null && sf.items.has(String(itemVal)));
    const okCat = cf.all || cf.vals.has(String(catVal));
    return okSide && okCat;
  }
  window.__ecommMatches = matches;

  // When one or more sides are picked, the panel shows only those sides'
  // items (Jay 9/15). Already-checked items from other sides stay ACTIVE but
  // hidden, and reappear when their side or "All" is selected again.
  function narrowSidePanel() {
    const root = document.getElementById("sideMs");
    if (!root) return;
    const cbs = Array.from(root.querySelectorAll(".side-cb"));
    const allCb = cbs.find(c => c.value === "ALL");
    const picked = new Set(cbs.filter(c => c.checked && c.getAttribute("data-kind") === "side").map(c => c.value));
    const narrowing = !(allCb && allCb.checked) && picked.size > 0;
    cbs.forEach(c => {
      if (c.getAttribute("data-kind") !== "item") return;
      const show = !narrowing || picked.has(c.getAttribute("data-side")) || c.checked;
      c.parentElement.style.display = show ? "" : "none";
    });
    root.querySelectorAll("[data-side-group]").forEach(el => {
      el.style.display = (!narrowing || picked.has(el.getAttribute("data-side-group"))) ? "" : "none";
    });
  }

  function apply() {
    narrowSidePanel();
    const q = (search && search.value || "").trim().toUpperCase();
    tables.forEach(table => {
      Array.from(table.querySelectorAll("tbody tr")).forEach(r => {
        const okSearch = !q || (r.getAttribute("data-vsid") || "").includes(q)
          || (r.children[1] && r.children[1].textContent.toUpperCase().includes(q));
        const okFilter = matches(r.getAttribute("data-side"), r.getAttribute("data-cat"), r.getAttribute("data-item"));
        r.style.display = okSearch && okFilter ? "" : "none";
      });
    });
    if (trendSel) {
      Array.from(trendSel.options).forEach(o => {
        if (o.value === "ALL") return;
        const ok = matches(o.getAttribute("data-side"), o.getAttribute("data-cat"), o.value);
        o.hidden = !ok;
        if (!ok && trendSel.value === o.value) trendSel.value = "ALL";
      });
    }
    if (window.__renderEcommTrend) window.__renderEcommTrend();
    if (window.__recomputeAdsKpis) window.__recomputeAdsKpis();
    if (window.__renderAdsTrend) window.__renderAdsTrend();
  }
  sideMs = setupMs("sideMs", "sideMsBtn", "sideMsPanel", "side-cb", "All sides & items", apply);
  catMs = setupMs("catMs", "catMsBtn", "catMsPanel", "cat-cb", "All categories", apply);
  if (search) search.addEventListener("input", apply);
  apply();
})();

/* Day table: past months' daily columns start collapsed behind a month
 * Total column; ▸ expands them, ▾ folds them back. */
(function () {
  document.querySelectorAll(".month-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const mk = btn.getAttribute("data-mk");
      const cells = document.querySelectorAll(".mcol-" + CSS.escape(mk) + ".mcol-fold");
      const show = btn.textContent.trim() === "▸";
      cells.forEach(c => { c.style.display = show ? "" : "none"; });
      btn.textContent = show ? "▾" : "▸";
    });
  });
})();
