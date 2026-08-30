(function () {
  const el = document.getElementById("trendChart");
  const byWeek = window.__TREND_BY_SCOPE__;
  const byDay = window.__TREND_BY_SCOPE_DAILY__;
  const scopeSel = document.getElementById("sumTrendScope");
  const granBtns = Array.from(document.querySelectorAll(".sum-trend-gran-btn"));
  const heading = document.getElementById("sumTrendHeading");
  const note = document.getElementById("sumTrendNote");
  if (!el || !byWeek) return;

  let gran = "day";

  function fmtDate(s) {
    const d = new Date(s + "T00:00:00Z");
    return (d.getUTCMonth() + 1) + "/" + d.getUTCDate();
  }

  function render() {
    const key = scopeSel ? scopeSel.value : "PROGRAM";
    let points, partialWarning = "";

    if (gran === "day" && byDay) {
      const s = byDay[key] || byDay.PROGRAM || [];
      points = s.map((d) => ({ label: fmtDate(d.date), value: Number(d.units) || 0 }));
    } else {
      const s = byWeek[key] || byWeek.PROGRAM || [];
      points = s.map((d) => ({ label: "Wk " + d.fiscal_week, value: Number(d.units) || 0 }));
      // A week still in progress plots against complete weeks and reads as a
      // collapse; say so rather than letting the line imply a real decline.
      const daily = byDay && (byDay[key] || byDay.PROGRAM);
      if (daily && daily.length) {
        const lastDate = daily[daily.length - 1].date;
        const dow = new Date(lastDate + "T00:00:00Z").getUTCDay();
        const daysIn = ((dow - 6) + 7) % 7 + 1; // fiscal week starts Saturday
        if (daysIn < 7) {
          partialWarning = "Latest week is still in progress (" + daysIn + " of 7 days) — its bar is not comparable to completed weeks. Switch to Day for the real shape.";
        }
      }
    }
    drawLineChart(el, points, { color: "#7B1D42" });
    if (note) note.textContent = partialWarning;
  }

  if (scopeSel) scopeSel.addEventListener("change", render);
  granBtns.forEach((b) => {
    b.addEventListener("click", () => {
      gran = b.getAttribute("data-sum-gran");
      granBtns.forEach((x) => x.classList.toggle("active", x === b));
      if (heading) heading.textContent = gran === "day" ? "Daily Trend" : "Weekly Trend";
      render();
    });
  });
  render();
})();
