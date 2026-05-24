document.addEventListener("DOMContentLoaded", async () => {
    const typedEl = document.getElementById("typed-text");
    if (typedEl && typeof Typed !== "undefined") {
        new Typed("#typed-text", {
            strings: [
                "Backend & data engineering",
                "LLM training & evaluation",
                "MSc graduate · LUT University",
                "Open to roles in Finland",
            ],
            typeSpeed: 38,
            backSpeed: 24,
            backDelay: 2800,
            loop: true,
            smartBackspace: true,
            showCursor: true,
            cursorChar: "|",
        });
    }

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    initMobileNav();
    initActiveNav();
    initProjectTabs();

    await loadGithubProjects();
    refreshProjectPanels();
});

const DEFAULT_TABS = ["research", "backend", "data-engineering", "miscellaneous"];

function getProjectConfig() {
    return window.PORTFOLIO_CONFIG?.projects ?? { maxPerTab: 3, tabs: DEFAULT_TABS };
}

function initMobileNav() {
    const sidebar = document.getElementById("sidebar");
    const navToggle = document.querySelector(".nav-toggle");
    const overlay = document.querySelector(".sidebar-overlay");
    const navLinks = document.querySelectorAll(".nav-link");

    const closeMobileNav = () => {
        sidebar?.classList.remove("is-open");
        overlay?.classList.remove("is-visible");
        overlay?.setAttribute("hidden", "");
        navToggle?.setAttribute("aria-expanded", "false");
        navToggle?.setAttribute("aria-label", "Open navigation");
    };

    const openMobileNav = () => {
        sidebar?.classList.add("is-open");
        overlay?.classList.add("is-visible");
        overlay?.removeAttribute("hidden");
        navToggle?.setAttribute("aria-expanded", "true");
        navToggle?.setAttribute("aria-label", "Close navigation");
    };

    navToggle?.addEventListener("click", () => {
        if (sidebar?.classList.contains("is-open")) closeMobileNav();
        else openMobileNav();
    });

    overlay?.addEventListener("click", closeMobileNav);

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (window.matchMedia("(max-width: 768px)").matches) closeMobileNav();
        });
    });
}

function initActiveNav() {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("main section[id]");

    const setActiveNav = () => {
        const scrollY = window.scrollY + 100;
        let current = "";

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollY >= top && scrollY < top + height) {
                current = section.getAttribute("id") || "";
            }
        });

        navLinks.forEach((link) => {
            const href = link.getAttribute("href")?.slice(1);
            link.classList.toggle("active", href === current);
        });
    };

    window.addEventListener("scroll", setActiveNav, { passive: true });
    setActiveNav();
}

function getStaticProjectCards() {
    const source = document.querySelector("[data-static-projects]");
    if (!source) return [];
    return Array.from(source.querySelectorAll(".project-card[data-category]"));
}

function getGithubProjectCards() {
    const grid = document.querySelector("[data-github-grid]");
    if (!grid) return [];
    return Array.from(grid.querySelectorAll(".project-card[data-category]"));
}

function initProjectTabs() {
    const tabs = document.querySelectorAll(".project-tab");

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.tab;

            tabs.forEach((t) => {
                const isActive = t === tab;
                t.classList.toggle("is-active", isActive);
                t.setAttribute("aria-selected", String(isActive));
            });

            document.querySelectorAll(".project-panel").forEach((panel) => {
                const isActive = panel.dataset.panel === target;
                panel.classList.toggle("is-active", isActive);
                panel.hidden = !isActive;
            });
        });
    });
}

function collectProjectItems() {
    const items = [];

    getStaticProjectCards().forEach((el) => {
        items.push({
            element: el,
            category: el.dataset.category,
            sort: el.dataset.sort || "00000000",
            source: "static",
        });
    });

    getGithubProjectCards().forEach((el) => {
        items.push({
            element: el,
            category: el.dataset.category || "miscellaneous",
            sort: el.dataset.sort || "00000000",
            source: "github",
        });
    });

    return items;
}

function refreshProjectPanels() {
    const { maxPerTab = 3, tabs = DEFAULT_TABS } = getProjectConfig();
    const items = collectProjectItems();
    const buckets = Object.fromEntries(tabs.map((t) => [t, []]));

    items.forEach((item) => {
        const cat = item.category;
        if (buckets[cat]) buckets[cat].push(item);
    });

    tabs.forEach((tab) => {
        const grid = document.querySelector(`.project-panel[data-panel="${tab}"] .projects-grid`);
        if (!grid) return;

        const sorted = buckets[tab]
            .sort((a, b) => String(b.sort).localeCompare(String(a.sort)))
            .slice(0, maxPerTab);

        grid.innerHTML = "";

        if (sorted.length === 0) {
            grid.innerHTML = `<p class="projects-empty panel-soft"><i class="fas fa-folder-open"></i> No projects in this category yet. Add items in HTML or pin repos in your GitHub README.</p>`;
            return;
        }

        sorted.forEach(({ element }) => grid.appendChild(element.cloneNode(true)));
    });
}

window.refreshProjectPanels = refreshProjectPanels;
window.categorizeRepo = typeof categorizeRepo !== "undefined" ? categorizeRepo : undefined;
