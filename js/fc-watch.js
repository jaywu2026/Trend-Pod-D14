/* FC Inventory: Top-selling watch filter. Class-based so it composes with the
 * shared side/category/search filters (either mechanism hides a row). */
(function () {
  const btns = Array.from(document.querySelectorAll(".fc-watch-btn"));
  if (!btns.length) return;
  const table = document.querySelector("#olFc table");
  const note = document.getElementById("fcWatchNote");
  btns.forEach(b => b.addEventListener("click", () => {
    const watch = b.getAttribute("data-mode") === "watch";
    btns.forEach(x => x.classList.toggle("active", x === b));
    if (table) table.classList.toggle("fc-watch-only", watch);
    if (note) note.style.display = watch ? "" : "none";
  }));
})();
