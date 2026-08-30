// Lightweight US choropleth map. No external CDN dependency —
// state path data is baked server-side into window.__US_STATES_GEO__.
(function () {
  const geo = window.__US_STATES_GEO__;
  const svg = document.getElementById("usmap");
  if (!svg || !geo) return;

  const NS = "http://www.w3.org/2000/svg";
  const tooltip = document.getElementById("mapTooltip");
  const BASE_PATH = window.__BASE_PATH__ || "";
  const pathEls = {};

  Object.entries(geo.states).forEach(([name, info]) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", info.d);
    p.setAttribute("data-state", name);
    p.setAttribute("fill", "#F3E1E9");
    p.style.cursor = "pointer";
    svg.appendChild(p);
    pathEls[name] = p;

    p.addEventListener("mousemove", (e) => {
      if (!tooltip) return;
      const val = p.__value;
      const storeCount = p.__storeCount;
      tooltip.style.display = "block";
      tooltip.style.left = e.pageX + 14 + "px";
      tooltip.style.top = e.pageY - 10 + "px";
      const storeLine = storeCount != null ? `${storeCount} store${storeCount === 1 ? "" : "s"}<br>` : "";
      tooltip.innerHTML = `<strong>${titleCase(name)}</strong><br>${storeLine}${val != null ? val : "No data"}<br><span style="color:var(--muted);font-size:11px">Click for state detail →</span>`;
    });
    p.addEventListener("mouseleave", () => { if (tooltip) tooltip.style.display = "none"; });
    p.addEventListener("click", () => {
      window.location.href = `states.html?state=${encodeURIComponent(name)}`;
    });
  });

  function titleCase(s) {
    return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // dataByState: { STATE_NAME: number }, fmt: function(number) -> display string
  // storeCountByState (optional): { STATE_NAME: number }
  function paint(dataByState, fmt, storeCountByState) {
    const values = Object.values(dataByState).filter((v) => v > 0);
    const max = values.length ? Math.max(...values) : 0;
    Object.entries(pathEls).forEach(([name, p]) => {
      const v = dataByState[name] || 0;
      p.__value = v > 0 ? (fmt ? fmt(v) : v) : null;
      p.__storeCount = storeCountByState ? (storeCountByState[name] || 0) : null;
      if (max <= 0 || v <= 0) {
        p.setAttribute("fill", "#F3E1E9");
        return;
      }
      const t = Math.sqrt(v / max); // sqrt scale so mid-range states are still visible
      p.setAttribute("fill", mix("#FBEAF1", "#7B1D42", t));
    });
  }

  function mix(hex1, hex2, t) {
    const c1 = hexToRgb(hex1), c2 = hexToRgb(hex2);
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    return `rgb(${r},${g},${b})`;
  }
  function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  window.PHMap = { paint };
})();
