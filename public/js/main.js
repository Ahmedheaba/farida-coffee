// Auto-dismiss flash messages after 4 seconds
document.querySelectorAll(".flash").forEach((el) => {
  setTimeout(() => {
    el.style.transition = "opacity 0.5s";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 500);
  }, 4000);
});

// Confirm before delete actions
document.querySelectorAll("[data-confirm]").forEach((el) => {
  el.addEventListener("click", (e) => {
    if (!confirm(el.dataset.confirm)) e.preventDefault();
  });
});
// Live search suggestions
const searchInput = document.querySelector('input[name="search"]');
if (searchInput) {
  let timeout;
  const dropdown = document.createElement("div");
  dropdown.style.cssText = `
    position:absolute;top:calc(100% + 6px);left:0;right:0;
    background:white;border-radius:12px;
    box-shadow:0 8px 24px rgba(44,26,14,.15);
    overflow:hidden;z-index:999;display:none;
  `;
  searchInput.parentElement.appendChild(dropdown);

  searchInput.addEventListener("input", () => {
    clearTimeout(timeout);
    const val = searchInput.value.trim();
    if (val.length < 2) {
      dropdown.style.display = "none";
      return;
    }

    timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/products/search-suggestions?q=${encodeURIComponent(val)}`,
        );
        const data = await res.json();

        if (data.length === 0) {
          dropdown.style.display = "none";
          return;
        }

        dropdown.innerHTML = data
          .map(
            (p) => `
          <a href="/products/${p._id}" style="
            display:flex;align-items:center;gap:12px;
            padding:10px 16px;text-decoration:none;
            color:var(--espresso);font-size:.9rem;
            border-bottom:1px solid var(--cream-dark);
            transition:background .15s;
          "
          onmouseover="this.style.background='var(--cream)'"
          onmouseout="this.style.background='white'">
            <span style="font-size:1.1rem">☕</span>
            <div>
              <div style="font-weight:700">${p.name}</div>
              <div style="font-size:.78rem;color:#8C7B6E">${p.category} · EGP ${p.price}</div>
            </div>
          </a>
        `,
          )
          .join("");

        dropdown.style.display = "block";
      } catch (e) {}
    }, 300);
  });

  // Hide dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchInput.parentElement.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });
}
// ─── Mobile hamburger menu ────────────────────────────────────────────────
function toggleMenu() {
  const nav = document.getElementById("navbar-nav");
  const hamburger = document.getElementById("hamburger");
  const isOpen = nav.classList.toggle("open");
  hamburger.classList.toggle("open", isOpen);
  document.body.style.overflow = isOpen ? "hidden" : "";
}

// Close menu when a link is clicked
document.querySelectorAll(".navbar-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    document.getElementById("navbar-nav").classList.remove("open");
    document.getElementById("hamburger").classList.remove("open");
    document.body.style.overflow = "";
  });
});

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  const nav = document.getElementById("navbar-nav");
  const hamburger = document.getElementById("hamburger");
  if (
    nav &&
    hamburger &&
    !nav.contains(e.target) &&
    !hamburger.contains(e.target) &&
    nav.classList.contains("open")
  ) {
    nav.classList.remove("open");
    hamburger.classList.remove("open");
    document.body.style.overflow = "";
  }
});
// ─── Dark Mode ────────────────────────────────────────────────────────────
function toggleDark() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
  updateDarkToggle(isDark);
}

function updateDarkToggle(isDark) {
  const icon = document.getElementById("dark-icon");
  const label = document.getElementById("dark-label");
  if (!icon || !label) return;
  icon.textContent = isDark ? "☀️" : "🌙";
  label.textContent = isDark ? "Light" : "Dark";
}

// Apply saved preference on page load
(function () {
  const saved = localStorage.getItem("darkMode");
  if (saved === "enabled") {
    document.body.classList.add("dark");
    updateDarkToggle(true);
  }
})();
