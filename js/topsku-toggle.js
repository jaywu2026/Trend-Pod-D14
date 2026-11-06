(function () {
  const windowBtns = Array.from(document.querySelectorAll(".window-btn"));
  const sortBtns = Array.from(document.querySelectorAll(".topsort-btn"));
  const scopeBtns = Array.from(document.querySelectorAll(".topsku-scope-btn"));
  const views = Array.from(document.querySelectorAll(".topsku-view"));
  if (!views.length) return;

  let currentWindow = "total";
  let currentSort = "units";
  let currentScope = "all";

  const exportLink = document.getElementById("topSkusExport");

  function apply() {
    views.forEach((v) => {
      const scope = v.getAttribute("data-scope") || "top10";
      v.style.display = (v.getAttribute("data-window") === currentWindow
        && v.getAttribute("data-sort") === currentSort
        && scope === currentScope) ? "" : "none";
    });
    windowBtns.forEach((b) => b.classList.toggle("active", b.getAttribute("data-window") === currentWindow));
    sortBtns.forEach((b) => b.classList.toggle("active", b.getAttribute("data-sort") === currentSort));
    scopeBtns.forEach((b) => b.classList.toggle("active", b.getAttribute("data-scope") === currentScope));
    updateExportLink();
  }
  function updateExportLink() {
    if (!exportLink) return;
    const base = exportLink.getAttribute("href").split("?")[0];
    const p = new URLSearchParams({ window: currentWindow, sort: currentSort, scope: currentScope });
    const priCbs = Array.from(document.querySelectorAll(".pri-filter-cb"));
    const checked = priCbs.filter(c => c.checked).map(c => c.value);
    if (checked.length && checked.length < priCbs.length) p.set("tiers", checked.join("|"));
    const catCbs = Array.from(document.querySelectorAll(".cat-filter-cb"));
    const catChecked = catCbs.filter(c => c.checked).map(c => c.value);
    if (catChecked.length && catChecked.length < catCbs.length) p.set("cats", catChecked.join("|"));
    exportLink.setAttribute("href", base + "?" + p.toString());
  }
  windowBtns.forEach((b) => b.addEventListener("click", () => { currentWindow = b.getAttribute("data-window"); apply(); }));
  sortBtns.forEach((b) => b.addEventListener("click", () => { currentSort = b.getAttribute("data-sort"); apply(); }));
  scopeBtns.forEach((b) => b.addEventListener("click", () => { currentScope = b.getAttribute("data-scope"); apply(); }));

  // multi-choice prioritization filter: hides rows whose tier is unchecked,
  // across every pre-rendered view so it composes with the other toggles
  const priCbs = Array.from(document.querySelectorAll(".pri-filter-cb"));
  const priAll = document.getElementById("priAll");
  const catCbs = Array.from(document.querySelectorAll(".cat-filter-cb"));
  const catAll = document.getElementById("catAll");
  function applyRowFilters() {
    const pri = new Set(priCbs.filter(c => c.checked).map(c => c.value));
    const cats = new Set(catCbs.filter(c => c.checked).map(c => c.value));
    document.querySelectorAll(".topsku-view tbody tr[data-pri]").forEach((tr) => {
      const ok = pri.has(tr.getAttribute("data-pri"))
        && (!catCbs.length || cats.has(tr.getAttribute("data-cat")));
      tr.style.display = ok ? "" : "none";
    });
    if (priAll) priAll.checked = priCbs.every(c => c.checked);
    if (catAll) catAll.checked = catCbs.every(c => c.checked);
    updateExportLink();
  }
  const applyPri = applyRowFilters;
  priCbs.forEach((c) => c.addEventListener("change", applyRowFilters));
  if (priAll) priAll.addEventListener("change", () => {
    priCbs.forEach(c => { c.checked = priAll.checked; });
    applyRowFilters();
  });
  catCbs.forEach((c) => c.addEventListener("change", applyRowFilters));
  if (catAll) catAll.addEventListener("change", () => {
    catCbs.forEach(c => { c.checked = catAll.checked; });
    applyRowFilters();
  });
  updateExportLink();
})();
