/* SKU Detail: sort all three granularity tables by Total Units or Total
 * Sales $ (desc), or restore the default order. Reordering rows composes
 * with the side/category/search filters (they hide, we order). */
(function () {
  const btns = Array.from(document.querySelectorAll(".sku-sort-btn"));
  if (!btns.length) return;
  const bodies = Array.from(document.querySelectorAll("#olSku .gran-view tbody"));
  bodies.forEach(tb => Array.from(tb.querySelectorAll("tr.sku-row"))
    .forEach((tr, i) => tr.setAttribute("data-oi", i)));
  function apply(mode) {
    for (const tb of bodies) {
      const rows = Array.from(tb.querySelectorAll("tr.sku-row"));
      rows.sort((a, b) => mode === "default"
        ? Number(a.getAttribute("data-oi")) - Number(b.getAttribute("data-oi"))
        : Number(b.getAttribute("data-" + mode)) - Number(a.getAttribute("data-" + mode)));
      rows.forEach(r => tb.appendChild(r));
    }
  }
  btns.forEach(b => b.addEventListener("click", () => {
    btns.forEach(x => x.classList.toggle("active", x === b));
    apply(b.getAttribute("data-sort"));
  }));
})();
