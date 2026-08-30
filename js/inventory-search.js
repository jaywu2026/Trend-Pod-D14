(function () {
  const search = document.getElementById("invSearch");
  const itemFilter = document.getElementById("itemFilter");
  const outlookFilter = document.getElementById("sellThroughFilter");
  const heroFilter = document.getElementById("heroFilter");
  if (!search) return;
  const tables = Array.from(document.querySelectorAll(".inv-table"));

  function apply() {
    const q = (search.value || "").trim().toUpperCase();
    const item = itemFilter ? itemFilter.value : "ALL";
    const outlook = outlookFilter ? outlookFilter.value : "ALL";
    const hero = heroFilter ? heroFilter.value : "ALL";
    tables.forEach((table) => {
      Array.from(table.querySelectorAll("tbody tr")).forEach((r) => {
        const matchesSearch = !q || r.getAttribute("data-vsid").includes(q);
        const matchesItem = item === "ALL" || r.getAttribute("data-item") === item;
        const matchesOutlook = outlook === "ALL" || r.getAttribute("data-outlook") === outlook;
        const matchesHero = hero === "ALL" || r.getAttribute("data-hero") === "true";
        r.style.display = matchesSearch && matchesItem && matchesOutlook && matchesHero ? "" : "none";
      });
    });
  }
  search.addEventListener("input", apply);
  if (itemFilter) itemFilter.addEventListener("change", apply);
  if (outlookFilter) outlookFilter.addEventListener("change", apply);
  if (heroFilter) heroFilter.addEventListener("change", apply);
  apply(); // respect whatever the dropdowns' default selections are on first load
})();
