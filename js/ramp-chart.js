/* Actual vs. Forecast by Month — client-rendered grouped-bar SVGs so the
 * scope (Program / Side / single item) and metric ($ / Units) can switch
 * without a server round trip. Data: window.__RAMP__ = { scopeId: [months] }. */
(function () {
  const data = window.__RAMP__;
  const scopeSel = document.getElementById("rampScope");
  const leftEl = document.getElementById("rampLeft");
  const rightEl = document.getElementById("rampRight");
  const leftTitle = document.getElementById("rampLeftTitle");
  const rightTitle = document.getElementById("rampRightTitle");
  if (!data || !scopeSel || !leftEl || !rightEl) return;

  let metric = "dollars";

  const fmt = n => Math.round(n).toLocaleString("en-US");
  const fmt$ = n => "$" + Math.round(n).toLocaleString("en-US");
  const k$ = v => v >= 1000 ? "$" + (v / 1000).toFixed(0) + "K" : fmt$(v);
  const kU = v => v >= 1000 ? (v / 1000).toFixed(1) + "K" : fmt(v);

  function chart(series, fmtVal) {
    const W = 480, H = 300, padL = 10, padB = 28, padT = 30;
    const innerH = H - padB - padT;
    const maxV = Math.max(1, ...series.flatMap(s => [s.act || 0, s.fc || 0]));
    const groupW = (W - padL * 2) / series.length;
    const barW = Math.min(34, groupW / 2.6);
    let out = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">`;
    series.forEach((s, i) => {
      const cx = padL + groupW * i + groupW / 2;
      const bars = [
        { v: s.act, x: cx - barW - 2, color: "#7B1D42" },
        { v: s.fc,  x: cx + 2,        color: "#DFA7BC" },
      ];
      for (const b of bars) {
        if (b.v === null || b.v === undefined) continue;
        const h = Math.max(1, innerH * (b.v / maxV));
        const y = padT + innerH - h;
        out += `<rect x="${b.x}" y="${y}" width="${barW}" height="${h}" rx="3" fill="${b.color}"/>`;
        out += `<text x="${b.x + barW / 2}" y="${y - 6}" text-anchor="middle" font-size="10.5" fill="#5A3A46">${fmtVal(b.v)}</text>`;
      }
      out += `<text x="${cx}" y="${H - 8}" text-anchor="middle" font-size="12" fill="#8A6B75">${s.label}</text>`;
    });
    return out + "</svg>";
  }

  function render() {
    const months = data[scopeSel.value] || data.PROGRAM;
    if (metric === "dollars") {
      leftTitle.textContent = "$ / Store / Week by Month";
      rightTitle.textContent = "Total $ by Month";
      leftEl.innerHTML = chart(months.map(m => ({ label: m.label, act: m.actDps, fc: m.fcDps })),
        v => "$" + (v >= 100 ? Math.round(v).toLocaleString("en-US") : v.toFixed(2)));
      rightEl.innerHTML = chart(months.map(m => ({ label: m.label, act: m.actTotalS, fc: m.fcTotalS })), k$);
    } else {
      leftTitle.textContent = "Units / Store / Week by Month";
      rightTitle.textContent = "Total Units by Month";
      leftEl.innerHTML = chart(months.map(m => ({ label: m.label, act: m.actUsw, fc: m.fcUsw })),
        v => v >= 100 ? fmt(v) : v.toFixed(2));
      rightEl.innerHTML = chart(months.map(m => ({ label: m.label, act: m.actTotalU, fc: m.fcTotalU })), kU);
    }
  }

  document.querySelectorAll(".ramp-btn").forEach(b => {
    b.addEventListener("click", () => {
      metric = b.getAttribute("data-ramp");
      document.querySelectorAll(".ramp-btn").forEach(x => x.classList.toggle("active", x === b));
      render();
    });
  });
  scopeSel.addEventListener("change", render);
  render();
})();
