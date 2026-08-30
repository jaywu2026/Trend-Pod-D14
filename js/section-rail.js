(function () {
  const rail = document.querySelector(".section-rail");
  if (!rail) return;
  const links = Array.from(rail.querySelectorAll("a"));
  const sections = links
    .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
    .filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + id));
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => observer.observe(s));
})();
