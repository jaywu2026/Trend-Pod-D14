(function () {
  const blocks = Array.from(document.querySelectorAll(".sku-detail-block"));
  if (!blocks.length) return;

  function apply(selectedScopes) {
    const showAll = selectedScopes.indexOf("SIDE_TOTAL") !== -1;
    const selectedItems = selectedScopes
      .filter((s) => s.indexOf("ITEM_") === 0)
      .map((s) => s.slice(5));
    // a category scope shows every member item's detail block
    const selectedCats = selectedScopes
      .filter((s) => s.indexOf("CAT_") === 0)
      .map((s) => s.slice(4).split("__")[1]);
    blocks.forEach((b) => {
      const match = showAll
        || selectedItems.indexOf(b.getAttribute("data-item")) !== -1
        || selectedCats.indexOf(b.getAttribute("data-cat")) !== -1;
      b.style.display = match ? "" : "none";
    });
  }

  document.addEventListener("scopeschange", (e) => apply(e.detail.scopes));
  apply(window.__getSelectedScopes ? window.__getSelectedScopes() : ["SIDE_TOTAL"]);
})();
