(function () {
  const search = document.getElementById("skuSearch");
  const category = document.getElementById("categoryFilter");
  if (!search || !category) return;
  const tables = Array.from(document.querySelectorAll(".ecomm-table"));
  if (!tables.length) return;

  function apply() {
    const q = (search.value || "").trim().toUpperCase();
    const cat = category.value;
    tables.forEach((table) => {
      Array.from(table.querySelectorAll("tbody tr")).forEach((r) => {
        const matchesSearch = !q || r.getAttribute("data-vsid").includes(q);
        const matchesCat = cat === "ALL" || r.getAttribute("data-side") === cat;
        r.style.display = matchesSearch && matchesCat ? "" : "none";
      });
    });
  }
  search.addEventListener("input", apply);
  category.addEventListener("change", apply);
})();
