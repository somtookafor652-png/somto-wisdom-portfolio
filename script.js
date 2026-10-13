/* =====================================================
   EDIT YOUR CONTENT HERE
   Change anything inside the quotes. Save, then refresh.
   ===================================================== */
const CONFIG = {
  // ---- YOUR DETAILS ----
  name: "Somto Wisdom",
  initials: "SW",
  title: "web developer",
  photo: "images/IMG_20261003_171747_354 (1).png",            // your picture

  phone: "08147028641",                   // shown on the site
  phoneIntl: "+2348147028641",            // used for the call button
  email: "somtookafor652@gmail.com",
  whatsapp: "https://wa.me/qr/IML4ODBEPO32F1",
  instagram: "https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=avb56mr",

  // ---- STATS (About section) ----
  stats: [
    { value: "3", label: "Featured projects" },
    { value: "3", label: "Core languages" },
    { value: "100%", label: "Mobile responsive" }
  ],

  // ---- WHAT I DO ----
  services: [
    { title: "Website design", text: "Clean, modern layouts that match your brand and are easy to read." },
    { title: "Front-end development", text: "Responsive pages built with HTML, CSS and JavaScript." },
    { title: "Landing pages", text: "Single pages that explain your product and get people to act." },
    { title: "Dashboards and web apps", text: "Interactive screens with menus, forms and live content." }
  ],

  // ---- PROJECTS (image = file inside the images folder) ----
  projects: [
    {
      title: "Sarvoraa",
      text: "A food-ordering page with a menu selector. Pick a meal, see its photo, description and price, then place an order.",
      image: "images/web food.webp",
      tags: ["HTML", "CSS", "JavaScript"],
      link: ""        // paste the live link here when it is deployed
    },
    {
      title: "Bitcoin landing page",
      text: "A dark landing page with a live-style price card, time range buttons, market stats and a clear call to action.",
      image: "images/bitcoin.webp",
      tags: ["HTML", "CSS", "JavaScript"],
      link: ""
    },
    {
      title: "Game Shelf",
      text: "A games showcase built as a grid of cards. Each card has an image, a name, a genre and a play button.",
      image: "images/gameing.jpg",
      tags: ["HTML", "CSS", "JavaScript"],
      link: ""
    }
  ],

  // ---- SKILLS ----
  skills: ["HTML", "CSS", "JavaScript", "Responsive design", "UI design", "Landing pages", "Dashboards", "Git and GitHub"]
};

/* =====================================================
   Code below builds the page. You don't need to edit it.
   ===================================================== */
const $ = (s, r = document) => r.querySelector(s);
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Text bindings
document.querySelectorAll("[data-bind]").forEach((el) => {
  const v = CONFIG[el.dataset.bind];
  if (v) el.textContent = v;
});
document.querySelectorAll("[data-bind-src]").forEach((el) => {
  const v = CONFIG[el.dataset.bindSrc];
  if (v) el.src = v;
});
document.title = `${CONFIG.name} | ${CONFIG.title.replace(/^./, (c) => c.toUpperCase())}`;
$("#year").textContent = new Date().getFullYear();

// Stats
$("#stats").innerHTML = CONFIG.stats
  .map((s) => `<li><strong>${esc(s.value)}</strong><span>${esc(s.label)}</span></li>`)
  .join("");

// Services
$("#services-list").innerHTML = CONFIG.services
  .map((s) => `<article class="card"><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`)
  .join("");

// Projects
$("#projects-list").innerHTML = CONFIG.projects
  .map((p) => {
    const action = p.link
      ? `<a class="btn btn-small" href="${esc(p.link)}" target="_blank" rel="noopener">View live site</a>`
      : "";
    return `
    <article class="project">
      <div class="shot"><img src="${esc(p.image)}" alt="Screenshot of ${esc(p.title)}" loading="lazy" onerror="this.classList.add('missing')" /></div>
      <div class="project-body">
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
        <ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
        ${action}
      </div>
    </article>`;
  })
  .join("");

// Skills
$("#skills-list").innerHTML = CONFIG.skills.map((s) => `<li>${esc(s)}</li>`).join("");

// Contact
const contacts = [
  { label: "Call or text", value: CONFIG.phone, href: `tel:${CONFIG.phoneIntl}` },
  { label: "Email", value: CONFIG.email, href: `mailto:${CONFIG.email}` },
  { label: "WhatsApp", value: "Chat with me", href: CONFIG.whatsapp, external: true },
  { label: "Instagram", value: "Follow my work", href: CONFIG.instagram, external: true }
];
$("#contact-list").innerHTML = contacts
  .map(
    (c) => `
  <a class="contact-card" href="${esc(c.href)}"${c.external ? ' target="_blank" rel="noopener"' : ""}>
    <span>${esc(c.label)}</span>
    <strong>${esc(c.value)}</strong>
  </a>`
  )
  .join("");

// Mobile menu
const burger = $("#burger");
const menu = $("#menu");
burger.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    menu.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
});

// Gentle reveal on scroll
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduce && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".section").forEach((el) => { el.classList.add("reveal"); io.observe(el); });
}
