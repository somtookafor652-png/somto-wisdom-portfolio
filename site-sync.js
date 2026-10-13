/* ==============================================================
   SITE SYNC  - connects your portfolio (index.html) to the admin.
   Add these two lines at the bottom of index.html, before </body>:
       <script src="site-data.js"></script>
       <script src="site-sync.js"></script>
   Then mark your HTML with the data attributes in README.txt
   ============================================================== */
(function () {
  var base = window.SITE_DATA || {};
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem("portfolio_data")); } catch (e) {}
  var D = saved || base;
  var get = function (o, p) { return p.split(".").reduce(function (a, k) { return a ? a[k] : undefined; }, o); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  function run() {
    // text:  data-bind="profile.name"
    document.querySelectorAll("[data-bind]").forEach(function (el) { var v = get(D, el.dataset.bind); if (v != null && v !== "") el.textContent = v; });
    // image: data-bind-src="profile.photo"
    document.querySelectorAll("[data-bind-src]").forEach(function (el) { var v = get(D, el.dataset.bindSrc); if (v) el.src = v; });
    // link:  data-bind-href="profile.github"  (use data-prefix="mailto:" or "tel:")
    document.querySelectorAll("[data-bind-href]").forEach(function (el) {
      var v = get(D, el.dataset.bindHref);
      if (v) el.href = (el.dataset.prefix || "") + v; else if (el.dataset.hideEmpty !== undefined) el.style.display = "none";
    });

    // Projects:  <div data-list="projects"></div>
    var pl = document.querySelector('[data-list="projects"]');
    if (pl && D.projects) pl.innerHTML = D.projects.map(function (p) {
      return '<article class="project-card">' +
        (p.image ? '<img class="project-img" src="' + esc(p.image) + '" alt="' + esc(p.title) + '">' : '') +
        '<div class="project-body"><h3>' + esc(p.title) + '</h3><p>' + esc(p.desc) + '</p>' +
        '<div class="project-tags">' + (p.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join("") + '</div>' +
        (p.link ? '<a class="project-link" href="' + esc(p.link) + '" target="_blank" rel="noopener" aria-label="Open ' + esc(p.title) + '">&#8599;</a>' : '') +
        '</div></article>';
    }).join("");

    // Skills:  <div data-list="skills"></div>
    var sl = document.querySelector('[data-list="skills"]');
    if (sl && D.skills) sl.innerHTML = D.skills.map(function (s) { return '<div class="skill-item">' + esc(s.name) + '</div>'; }).join("");

    // Highlights:  <ul data-list="points"></ul>
    var hl = document.querySelector('[data-list="points"]');
    if (hl && D.about) hl.innerHTML = D.about.points.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("");

    // Contact form:  <form data-contact-form> with inputs named name, email, message
    document.querySelectorAll("form[data-contact-form]").forEach(function (f) {
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(f), list = [];
        try { list = JSON.parse(localStorage.getItem("portfolio_messages")) || []; } catch (x) {}
        list.unshift({ name: fd.get("name"), email: fd.get("email"), message: fd.get("message"), date: new Date().toISOString(), read: false });
        localStorage.setItem("portfolio_messages", JSON.stringify(list));
        f.reset(); alert("Thanks! Your message has been sent.");
      });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
