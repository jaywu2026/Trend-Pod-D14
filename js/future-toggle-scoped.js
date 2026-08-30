(function () {
  document.querySelectorAll(".future-toggle").forEach(function (cb) {
    const targetId = cb.getAttribute("data-target");
    const target = document.getElementById(targetId);
    if (!target) return;
    function apply() { target.classList.toggle("show-future", cb.checked); }
    cb.addEventListener("change", apply);
    apply();
  });
})();
