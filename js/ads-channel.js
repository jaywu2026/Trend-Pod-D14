/* Ad Performance channel toggle: Sponsored Search <-> Display panels, plus the
 * display week selector. Pure show/hide — data for both is server-rendered. */
(function () {
  const btns = Array.from(document.querySelectorAll(".ads-ch-btn"));
  const panels = { search: document.getElementById("adsChSearch"), display: document.getElementById("adsChDisplay") };
  if (!btns.length || !panels.search) return;
  btns.forEach(b => b.addEventListener("click", () => {
    const ch = b.getAttribute("data-ch");
    btns.forEach(x => x.classList.toggle("active", x === b));
    for (const k in panels) if (panels[k]) panels[k].style.display = k === ch ? "" : "none";
  }));
  const podBtns = Array.from(document.querySelectorAll(".disp-pod-btn"));
  const dispPanel = panels.display;
  podBtns.forEach(b => b.addEventListener("click", () => {
    podBtns.forEach(x => x.classList.toggle("active", x === b));
    if (dispPanel) dispPanel.classList.toggle("disp-pod-only", b.getAttribute("data-mode") === "pod");
  }));
  const wkSel = document.getElementById("displayWkSel");
  if (wkSel) wkSel.addEventListener("change", () => {
    document.querySelectorAll(".display-wk").forEach(el =>
      el.style.display = el.getAttribute("data-fw") === wkSel.value ? "" : "none");
  });
})();
