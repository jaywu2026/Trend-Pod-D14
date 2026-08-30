// Minimal dependency-free SVG line chart.
function drawLineChart(containerEl, points, opts) {
  opts = opts || {};
  const W = opts.width || 900, H = opts.height || 260, PAD = 40, PAD_LEFT = 56;
  if (!points.length) {
    containerEl.innerHTML = '<p style="color:var(--muted)">暂无数据</p>';
    return;
  }
  const xs = points.map((_, i) => i);
  const ys = points.map((p) => p.value);
  const dataMax = Math.max(...ys, 1);
  const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;
  // Scale so the TYPICAL value sits around ~35% up the chart (this program
  // just launched — early actuals are naturally small, and letting the axis
  // auto-fit to today's max makes every wiggle look dramatic). A day that's
  // genuinely much higher than average will still show taller, since the
  // axis is anchored to the average, not the current max.
  const targetAxisMax = avgY > 0 ? avgY / 0.35 : dataMax;
  const maxY = Math.max(targetAxisMax, dataMax * 1.05, 1);
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.style.width = "100%";
  svg.style.height = "auto";

  const xStep = (W - PAD_LEFT - PAD) / Math.max(points.length - 1, 1);
  const scaleY = (v) => H - PAD - (v / maxY) * (H - PAD * 2);
  const scaleX = (i) => PAD_LEFT + i * xStep;

  // gridlines + y-axis value labels
  for (let g = 0; g <= 4; g++) {
    const y = PAD + (g * (H - PAD * 2)) / 4;
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", PAD_LEFT); line.setAttribute("x2", W - PAD);
    line.setAttribute("y1", y); line.setAttribute("y2", y);
    line.setAttribute("stroke", "#F0D8E0"); line.setAttribute("stroke-width", "1");
    svg.appendChild(line);

    const val = maxY * (1 - g / 4);
    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", PAD_LEFT - 8); label.setAttribute("y", y + 4);
    label.setAttribute("font-size", "10"); label.setAttribute("fill", "#8A6B75");
    label.setAttribute("text-anchor", "end");
    label.textContent = val >= 1000 ? Math.round(val / 100) / 10 + "k" : Math.round(val).toLocaleString();
    svg.appendChild(label);
  }

  // line path
  const d = xs.map((i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(ys[i])}`).join(" ");
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", opts.color || "#7B1D42");
  path.setAttribute("stroke-width", "2.5");
  svg.appendChild(path);

  // area fill
  const areaD = `${d} L ${scaleX(xs.length - 1)} ${H - PAD} L ${scaleX(0)} ${H - PAD} Z`;
  const area = document.createElementNS(svgNS, "path");
  area.setAttribute("d", areaD);
  area.setAttribute("fill", opts.color || "#7B1D42");
  area.setAttribute("opacity", "0.08");
  svg.insertBefore(area, path);

  // points + x labels (thin out labels if many points)
  const labelEvery = Math.ceil(points.length / 10);
  points.forEach((p, i) => {
    const cx = scaleX(i), cy = scaleY(ys[i]);
    const c = document.createElementNS(svgNS, "circle");
    c.setAttribute("cx", cx); c.setAttribute("cy", cy); c.setAttribute("r", 3);
    c.setAttribute("fill", opts.color || "#7B1D42");
    svg.appendChild(c);
    if (i % labelEvery === 0 || i === points.length - 1) {
      const t = document.createElementNS(svgNS, "text");
      t.setAttribute("x", cx); t.setAttribute("y", H - 10);
      t.setAttribute("font-size", "10"); t.setAttribute("fill", "#8A6B75");
      t.setAttribute("text-anchor", "middle");
      t.textContent = p.label;
      svg.appendChild(t);
    }
  });

  containerEl.innerHTML = "";
  containerEl.appendChild(svg);
}

// Multiple overlaid line series with a legend — used when the Scope
// multi-select has more than one item checked. series: [{label, points, color}]
const MULTI_LINE_PALETTE = ["#7B1D42", "#2E86AB", "#3FA34D", "#E08E45", "#8E44AD", "#C0392B", "#16A085", "#B8860B"];
function drawMultiLineChart(containerEl, series, opts) {
  opts = opts || {};
  series = series.filter((s) => s.points && s.points.length);
  if (!series.length) {
    containerEl.innerHTML = '<p style="color:var(--muted)">暂无数据</p>';
    return;
  }
  if (series.length === 1) {
    drawLineChart(containerEl, series[0].points, { color: series[0].color || opts.color });
    renderLegend(containerEl, series);
    return;
  }

  const W = opts.width || 900, H = opts.height || 260, PAD = 40, PAD_LEFT = 56;
  const pointCount = Math.max(...series.map((s) => s.points.length));
  const allY = series.flatMap((s) => s.points.map((p) => p.value));
  const dataMax = Math.max(...allY, 1);
  const avgY = allY.reduce((a, b) => a + b, 0) / allY.length;
  const targetAxisMax = avgY > 0 ? avgY / 0.35 : dataMax;
  const maxY = Math.max(targetAxisMax, dataMax * 1.05, 1);

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.style.width = "100%";
  svg.style.height = "auto";

  const xStep = (W - PAD_LEFT - PAD) / Math.max(pointCount - 1, 1);
  const scaleY = (v) => H - PAD - (v / maxY) * (H - PAD * 2);
  const scaleX = (i) => PAD_LEFT + i * xStep;

  for (let g = 0; g <= 4; g++) {
    const y = PAD + (g * (H - PAD * 2)) / 4;
    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", PAD_LEFT); line.setAttribute("x2", W - PAD);
    line.setAttribute("y1", y); line.setAttribute("y2", y);
    line.setAttribute("stroke", "#F0D8E0"); line.setAttribute("stroke-width", "1");
    svg.appendChild(line);

    const val = maxY * (1 - g / 4);
    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", PAD_LEFT - 8); label.setAttribute("y", y + 4);
    label.setAttribute("font-size", "10"); label.setAttribute("fill", "#8A6B75");
    label.setAttribute("text-anchor", "end");
    label.textContent = val >= 1000 ? Math.round(val / 100) / 10 + "k" : Math.round(val).toLocaleString();
    svg.appendChild(label);
  }

  let sharedLabels = null;
  series.forEach((s, si) => {
    const color = s.color || MULTI_LINE_PALETTE[si % MULTI_LINE_PALETTE.length];
    const pts = s.points;
    if (!sharedLabels || pts.length > sharedLabels.length) sharedLabels = pts;
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(p.value)}`).join(" ");
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "2.5");
    svg.appendChild(path);
    pts.forEach((p, i) => {
      const c = document.createElementNS(svgNS, "circle");
      c.setAttribute("cx", scaleX(i)); c.setAttribute("cy", scaleY(p.value)); c.setAttribute("r", 3);
      c.setAttribute("fill", color);
      svg.appendChild(c);
    });
  });

  const labelEvery = Math.ceil(sharedLabels.length / 10);
  sharedLabels.forEach((p, i) => {
    if (i % labelEvery === 0 || i === sharedLabels.length - 1) {
      const t = document.createElementNS(svgNS, "text");
      t.setAttribute("x", scaleX(i)); t.setAttribute("y", H - 10);
      t.setAttribute("font-size", "10"); t.setAttribute("fill", "#8A6B75");
      t.setAttribute("text-anchor", "middle");
      t.textContent = p.label;
      svg.appendChild(t);
    }
  });

  containerEl.innerHTML = "";
  containerEl.appendChild(svg);
  renderLegend(containerEl, series.map((s, i) => ({ ...s, color: s.color || MULTI_LINE_PALETTE[i % MULTI_LINE_PALETTE.length] })));
}

function renderLegend(containerEl, series) {
  if (series.length < 2) return;
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;font-size:12px";
  series.forEach((s) => {
    const item = document.createElement("span");
    item.style.cssText = "display:inline-flex;align-items:center;gap:5px";
    item.innerHTML = `<span style="width:10px;height:10px;border-radius:2px;background:${s.color};display:inline-block"></span>${s.label}`;
    wrap.appendChild(item);
  });
  containerEl.appendChild(wrap);
}
