/* Ad Performance: (1) KPI cards recompute from the rows the shared filter
 * leaves visible; (2) weekly trend chart + table with own item/metric pickers,
 * also honouring the shared Side/Category filter. */
(function () {
  const fmt = n => Math.round(n).toLocaleString("en-US");
  const fmt$ = (n, d) => "$" + (d ? n.toFixed(d) : Math.round(n).toLocaleString("en-US"));
  const pct = n => (n * 100).toFixed(2) + "%";
  const matches = () => window.__ecommMatches || (() => true);

  /* ---------- (1) KPI recompute ---------- */
  const kpiBox = document.getElementById("adsKpis");
  function recomputeKpis() {
    if (!kpiBox) return;
    const rows = Array.from(document.querySelectorAll("tr.ads-row"));
    const vis = rows.filter(r => r.style.display !== "none");
    const t = { spend: 0, sales: 0, salestot: 0, instore: 0, units: 0, imp: 0, clk: 0, ord: 0 };
    vis.forEach(r => { for (const k in t) t[k] += Number(r.getAttribute("data-" + k)) || 0; });
    const set = (k, v) => { const el = kpiBox.querySelector(`[data-k="${k}"]`); if (el) el.textContent = v; };
    set("spend", fmt$(t.spend)); set("sales", fmt$(t.sales)); set("units", fmt(t.units));
    set("imp", fmt(t.imp)); set("clk", fmt(t.clk)); set("ord", fmt(t.ord));
    set("roas", t.spend > 0 ? (t.sales / t.spend).toFixed(2) : "—");
    set("totalRoas", t.spend > 0 ? (t.salestot / t.spend).toFixed(2) : "—");
    set("instore", "+ " + fmt$(t.instore) + " in-store attributed");
    set("cpc", t.clk > 0 ? fmt$(t.spend / t.clk, 2) : "—");
    set("ctr", t.imp > 0 ? pct(t.clk / t.imp) : "—");
    set("scope", vis.length === rows.length ? "all SKUs" : `${vis.length} of ${rows.length} SKUs (filtered)`);
  }
  window.__recomputeAdsKpis = recomputeKpis;
  recomputeKpis();

  /* ---------- (2) weekly trend ---------- */
  const data = window.__ADS_WEEKLY__;
  const itemSel = document.getElementById("adsTrendItem");
  const selA = document.getElementById("adsMetricA");
  const selB = document.getElementById("adsMetricB");
  const chartEl = document.getElementById("adsTrendChart");
  const table = document.getElementById("adsTrendTable");
  if (!data || !itemSel || !chartEl || !table) return;

  const METRICS = {
    spend: { label: "Spend", fmt: v => fmt$(v), raw: true },
    sales: { label: "Ad Sales", fmt: v => fmt$(v), raw: true },
    units: { label: "Ad Units", fmt: v => fmt(v), raw: true },
    imp:   { label: "Impressions", fmt: v => fmt(v), raw: true },
    clk:   { label: "Clicks", fmt: v => fmt(v), raw: true },
    ord:   { label: "Orders", fmt: v => fmt(v), raw: true },
    roas:  { label: "ROAS", fmt: v => v === null ? "—" : v.toFixed(2) },
    totalRoas: { label: "Total ROAS (incl. in-store)", fmt: v => v === null ? "—" : v.toFixed(2) },
    ctr:   { label: "CTR", fmt: v => v === null ? "—" : pct(v) },
    cpc:   { label: "CPC", fmt: v => v === null ? "—" : fmt$(v, 2) },
  };
  function derive(t) {
    return {
      ...t,
      roas: t.spend > 0 ? t.sales / t.spend : null,
      totalRoas: t.spend > 0 ? (t.salesTot || 0) / t.spend : null,
      ctr: t.imp > 0 ? t.clk / t.imp : null,
      cpc: t.clk > 0 ? t.spend / t.clk : null,
    };
  }
  function selectedItems() {
    const m = matches();
    if (itemSel.value !== "ALL") return [itemSel.value];
    return Object.keys(data.byItem).filter(it => {
      const md = data.meta[it] || {};
      return m(md.side, md.cat, it);
    });
  }
  function weekRows() {
    const items = selectedItems();
    return data.weeks.map(w => {
      const t = { spend: 0, sales: 0, units: 0, salesTot: 0, imp: 0, clk: 0, ord: 0 };
      for (const it of items) {
        const s = (data.byItem[it] || {})[w.fw];
        if (!s) continue;
        t.spend += s.spend; t.sales += s.sales; t.units += s.units;
        t.salesTot += (s.salesTot || 0);
        t.imp += s.imp; t.clk += s.clk; t.ord += s.ord;
      }
      return { ...w, ...derive(t) };
    });
  }

  function drawChart(rows, a, b) {
    const W = 900, H = 260, PL = 62, PR = b ? 62 : 16, PT = 18, PB = 40;
    const iw = W - PL - PR, ih = H - PT - PB;
    if (!rows.length) { chartEl.innerHTML = '<p style="color:var(--muted)">No data yet</p>'; return; }
    const xs = rows.map((_, i) => PL + (rows.length === 1 ? iw / 2 : iw * i / (rows.length - 1)));
    const vA = rows.map(r => r[a] === null ? 0 : r[a]);
    const vB = b ? rows.map(r => r[b] === null ? 0 : r[b]) : null;
    const maxA = Math.max(1e-9, ...vA), maxB = vB ? Math.max(1e-9, ...vB) : 1;
    const yA = v => PT + ih - ih * v / maxA, yB = v => PT + ih - ih * v / maxB;
    const path = (vals, yf) => vals.map((v, i) => `${i ? "L" : "M"}${xs[i].toFixed(1)},${yf(v).toFixed(1)}`).join(" ");
    const area = (vals, yf) => path(vals, yf) + ` L${xs[xs.length - 1].toFixed(1)},${PT + ih} L${xs[0].toFixed(1)},${PT + ih} Z`;
    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:inherit">`;
    for (let g = 0; g <= 4; g++) {
      const y = PT + ih * g / 4;
      svg += `<line x1="${PL}" x2="${W - PR}" y1="${y}" y2="${y}" stroke="#eee"/>`;
      svg += `<text x="${PL - 8}" y="${y + 4}" text-anchor="end" font-size="10.5" fill="#9E3060">${METRICS[a].fmt(maxA * (4 - g) / 4)}</text>`;
      if (b) svg += `<text x="${W - PR + 8}" y="${y + 4}" text-anchor="start" font-size="10.5" fill="#2C7BB6">${METRICS[b].fmt(maxB * (4 - g) / 4)}</text>`;
    }
    svg += `<path d="${area(vA, yA)}" fill="rgba(158,48,96,0.12)"/>`;
    svg += `<path d="${path(vA, yA)}" fill="none" stroke="#9E3060" stroke-width="2.2"/>`;
    if (vB) {
      svg += `<path d="${area(vB, yB)}" fill="rgba(44,123,182,0.10)"/>`;
      svg += `<path d="${path(vB, yB)}" fill="none" stroke="#2C7BB6" stroke-width="2.2" stroke-dasharray="5 3"/>`;
    }
    rows.forEach((r, i) => {
      svg += `<circle cx="${xs[i]}" cy="${yA(vA[i])}" r="3.2" fill="#9E3060"/>`;
      if (vB) svg += `<circle cx="${xs[i]}" cy="${yB(vB[i])}" r="3.2" fill="#2C7BB6"/>`;
      svg += `<text x="${xs[i]}" y="${H - 22}" text-anchor="middle" font-size="11" fill="#6B4A56">Wk ${r.fw}</text>`;
      svg += `<text x="${xs[i]}" y="${H - 9}" text-anchor="middle" font-size="9.5" fill="#9a8a90">${r.start.slice(5)}${r.days < 7 ? " · partial" : ""}</text>`;
    });
    svg += `<text x="${PL}" y="${PT - 6}" font-size="11" fill="#9E3060" font-weight="600">● ${METRICS[a].label}</text>`;
    if (b) svg += `<text x="${W - PR}" y="${PT - 6}" text-anchor="end" font-size="11" fill="#2C7BB6" font-weight="600">- - ${METRICS[b].label}</text>`;
    svg += "</svg>";
    chartEl.innerHTML = svg;
  }

  function drawTable(rows, a, b) {
    const cols = ["spend", "sales", "roas", "totalRoas", "units", "ord", "imp", "clk", "ctr", "cpc"];
    const hl = k => (k === a || k === b) ? ' style="background:#FFF3F7"' : "";
    let th = "<tr><th>Week</th>" + cols.map(k => `<th class="num"${hl(k)}>${METRICS[k].label}</th>`).join("") + "</tr>";
    let body = rows.map(r =>
      `<tr><td>Wk ${r.fw} <span style="color:var(--muted);font-size:11px">${r.start.slice(5)} – ${r.end.slice(5)}${r.days < 7 ? " · partial" : ""}</span></td>` +
      cols.map(k => `<td class="num"${hl(k)}>${METRICS[k].fmt(r[k])}</td>`).join("") + "</tr>").join("");
    const tot = derive(rows.reduce((t, r) => { for (const k of ["spend","sales","salesTot","units","imp","clk","ord"]) t[k] += (r[k] || 0); return t; },
      { spend: 0, sales: 0, salesTot: 0, units: 0, imp: 0, clk: 0, ord: 0 }));
    body += `<tr style="font-weight:700;border-top:2px solid var(--border)"><td>Total</td>` +
      cols.map(k => `<td class="num">${METRICS[k].fmt(tot[k])}</td>`).join("") + "</tr>";
    table.querySelector("thead").innerHTML = th;
    table.querySelector("tbody").innerHTML = body;
  }

  function render() {
    // narrow the item dropdown to the shared filter, like the eComm trend does
    const m = matches();
    Array.from(itemSel.options).forEach(o => {
      if (o.value === "ALL") return;
      const ok = m(o.getAttribute("data-side"), o.getAttribute("data-cat"), o.value);
      o.hidden = !ok;
      if (!ok && itemSel.value === o.value) itemSel.value = "ALL";
    });
    const a = selA.value, b = selB.value && selB.value !== a ? selB.value : "";
    const rows = weekRows();
    drawChart(rows, a, b);
    drawTable(rows, a, b);
  }
  [itemSel, selA, selB].forEach(el => el.addEventListener("change", render));
  window.__renderAdsTrend = render;
  render();
})();
