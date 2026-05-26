/**
 * GitHub projects for portfolio.
 * GitHub Pages: reads assets/data/github-repos.json (built on each push via Actions).
 * GitHub Pages: prefers static curated projects and avoids live API calls by default.
 */
function getGithubConfig() {
    return window.PORTFOLIO_CONFIG?.github ?? {
        username: "MiteshChakma",
        profileReadmeRepo: "MiteshChakma",
        readmeBranch: "master",
        excludeRepos: ["MiteshChakma"],
        maxDisplay: 24,
        preferStaticRepos: true,
        allowLiveFetch: false,
        staticReposPath: "assets/data/github-repos.json",
    };
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

function parseReposFromReadme(markdown, username) {
    const names = new Set();
    const user = username.toLowerCase();

    const block = markdown.match(/<!--\s*portfolio-repos:start\s*-->([\s\S]*?)<!--\s*portfolio-repos:end\s*-->/i);
    if (block) {
        block[1].split("\n").forEach((line) => {
            const trimmed = line.trim().replace(/^[-*]\s*/, "");
            if (!trimmed) return;
            const match = trimmed.match(/github\.com\/[^/]+\/([\w.-]+)/i);
            names.add(match ? match[1] : trimmed.split("/").pop());
        });
    }

    const linkRe = new RegExp(`github\\.com/${username}/([\\w.-]+)`, "gi");
    let m;
    while ((m = linkRe.exec(markdown)) !== null) {
        if (m[1].toLowerCase() !== user) names.add(m[1]);
    }

    return [...names];
}

async function fetchStaticRepos(cacheBust = false) {
    const config = getGithubConfig();
    const path = config.staticReposPath || "assets/data/github-repos.json";
    const url = cacheBust ? `${path}?t=${Date.now()}` : path;

    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function fetchProfileReadme(config) {
    const branch = config.readmeBranch || "master";
    const repo = config.profileReadmeRepo || config.username;
    const url = `https://raw.githubusercontent.com/${config.username}/${repo}/${branch}/README.md`;
    try {
        const res = await fetch(url);
        if (!res.ok) return "";
        return await res.text();
    } catch {
        return "";
    }
}

async function fetchPublicRepoNames(config) {
    const url = `https://api.github.com/users/${config.username}/repos?sort=${config.sortBy || "updated"}&per_page=100`;
    try {
        const res = await fetch(url, {
            headers: { Accept: "application/vnd.github+json" },
        });
        if (!res.ok) return [];
        const data = await res.json();
        const exclude = new Set((config.excludeRepos || []).map((r) => r.toLowerCase()));
        return data
            .filter((r) => !r.fork && !exclude.has(r.name.toLowerCase()))
            .map((r) => r.name);
    } catch {
        return [];
    }
}

async function fetchRepoDetails(username, name) {
    const url = `https://api.github.com/repos/${username}/${name}`;
    try {
        const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

function mergeRepoNames(readmeNames, apiNames, pinned, exclude, max) {
    const excludeSet = new Set(exclude.map((r) => r.toLowerCase()));
    const ordered = [];
    const seen = new Set();

    const add = (name) => {
        const key = name.toLowerCase();
        if (!name || seen.has(key) || excludeSet.has(key)) return;
        seen.add(key);
        ordered.push(name);
    };

    (pinned || []).forEach(add);
    readmeNames.forEach(add);
    apiNames.forEach(add);

    return ordered.slice(0, max);
}

function formatRelativeDate(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 30) return `Updated ${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `Updated ${months}mo ago`;
    return `Updated ${Math.floor(months / 12)}y ago`;
}

const CATEGORY_LABELS = {
    research: { label: "Research", tagClass: "tag-research", mediaClass: "cat-research" },
    backend: { label: "Backend", tagClass: "tag-backend", mediaClass: "cat-backend" },
    "data-engineering": {
        label: "Data engineering",
        tagClass: "tag-data",
        mediaClass: "cat-data",
    },
    miscellaneous: {
        label: "Miscellaneous",
        tagClass: "tag-misc",
        mediaClass: "cat-misc",
    },
};

function categorizeRepo(repo) {
    if (repo.category && CATEGORY_LABELS[repo.category]) return repo.category;

    const topics = (repo.topics || []).map((t) => t.toLowerCase());
    const blob = [...topics, (repo.language || "").toLowerCase(), (repo.description || "").toLowerCase(), (repo.name || "").toLowerCase()].join(" ");

    const researchKw = ["gis", "remote", "satellite", "land cover", "urban", "tensorflow", "ecology", "mangrove"];
    const backendKw = ["django", "flask", "fastapi", "backend", "rest", "nginx", "mobile", "postgres", "api"];
    const dataKw = ["data", "etl", "pipeline", "spark", "pandas", "llm", "nlp", "prompt", "pyspark", "mlops"];

    if (researchKw.some((k) => blob.includes(k)) && !backendKw.some((k) => blob.includes(k))) return "research";
    if (dataKw.some((k) => blob.includes(k))) return "data-engineering";
    if (backendKw.some((k) => blob.includes(k))) return "backend";
    return "miscellaneous";
}

function pickStackIconsForRepo(repo, lang) {
    const langMap = {
        Python: "assets/img/python.png",
        JavaScript: "assets/img/js.png",
        TypeScript: "assets/img/js.png",
        HTML: "assets/img/html.png",
        CSS: "assets/img/css.png",
        Jupyter: "assets/img/jupyter.png",
    };
    const icons = [];
    if (langMap[lang]) icons.push(langMap[lang]);
    if (lang === "Python" || (repo.topics || []).some((t) => /django/i.test(t))) {
        icons.push("assets/img/django.png");
    }
    if ((repo.topics || []).some((t) => /tensorflow|ml|pytorch/i.test(t))) {
        icons.push("assets/img/tensorflow.png");
    }
    if (!icons.length) icons.push("assets/img/python.png", "assets/img/github.png");
    return [...new Set(icons)].slice(0, 3);
}

function repoSortKey(repo) {
    if (repo.sort) return String(repo.sort);
    if (repo.pushed_at) return repo.pushed_at.slice(0, 10).replace(/-/g, "");
    return "00000000";
}

function formatGeneratedDate(iso) {
    if (!iso) return "";
    try {
        return new Date(iso).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return "";
    }
}

function createGithubProjectCard(repo) {
    const category = categorizeRepo(repo);
    const meta = CATEGORY_LABELS[category] || CATEGORY_LABELS.miscellaneous;
    const lang = repo.language || "Code";
    const topics = (repo.topics || []).slice(0, 3);
    const desc = escapeHtml(repo.description || "No description provided.");
    const name = escapeHtml(repo.name);
    const homepage = repo.homepage
        ? `<a class="text-link" href="${escapeHtml(repo.homepage)}" target="_blank" rel="noopener noreferrer">Demo</a>`
        : "";

    const collageClass =
        category === "research"
            ? "media-collage--research"
            : category === "backend"
              ? "media-collage--backend"
              : category === "data-engineering"
                ? "media-collage--data"
                : "media-collage--misc";

    const stackIcons = pickStackIconsForRepo(repo, lang);

    const card = document.createElement("article");
    card.className = "project-card panel-elevated";
    card.dataset.category = category;
    card.dataset.source = "github";
    card.dataset.repo = repo.name;
    card.dataset.sort = repoSortKey(repo);

    card.innerHTML = `
        <div class="project-card-media media-collage ${collageClass}">
            ${stackIcons.map((s) => `<img src="${s}" alt="">`).join("")}
            <img src="assets/img/github.png" alt="GitHub" class="collage-github-badge">
        </div>
        <div class="project-card-body">
            <span class="project-tag ${meta.tagClass}">${meta.label}</span>
            <h3>${name}</h3>
            <p class="project-meta">
                <span>${repo.stargazers_count ?? 0} stars</span>
                <span>${repo.forks_count ?? 0} forks</span>
                <span>${formatRelativeDate(repo.pushed_at)}</span>
            </p>
            <p>${desc}</p>
            ${topics.length ? `<div class="project-topics">${topics.map((t) => `<span class="topic-chip">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
            <div class="project-links">
                <a class="text-link" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">Repository</a>
                ${homepage}
            </div>
        </div>
    `;

    return card;
}

function createLoadingPlaceholder(count = 6) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const el = document.createElement("article");
        el.className = "project-card panel-soft project-card--skeleton";
        el.innerHTML = `
            <div class="skeleton-media"></div>
            <div class="skeleton-body">
                <div class="skeleton-line w-40"></div>
                <div class="skeleton-line w-80"></div>
                <div class="skeleton-line w-100"></div>
            </div>
        `;
        frag.appendChild(el);
    }
    return frag;
}

function createEmptyGithubMessage(message, isError = false) {
    const el = document.createElement("p");
    el.className = `projects-github-status panel-soft ${isError ? "is-error" : ""}`;
    el.innerHTML = message;
    return el;
}

function renderReposToGrid(repos, grid) {
    grid.innerHTML = "";
    if (!repos.length) {
        grid.appendChild(
            createEmptyGithubMessage(
                "No repositories yet. Add a <code>portfolio-repos</code> block to your profile README and push to GitHub."
            )
        );
        return [];
    }
    const cards = repos.map((repo) => createGithubProjectCard(repo));
    cards.forEach((card) => grid.appendChild(card));
    return cards;
}

async function loadGithubProjectsLive(config, grid, setStatus) {
    let readmeNames = [];
    if (config.includeFromReadme) {
        const readme = await fetchProfileReadme(config);
        readmeNames = parseReposFromReadme(readme, config.username);
    }

    let apiNames = [];
    if (config.includePublicRepos) {
        apiNames = await fetchPublicRepoNames(config);
    }

    const names = mergeRepoNames(
        readmeNames,
        apiNames,
        window.PORTFOLIO_CONFIG?.pinnedRepos,
        config.excludeRepos || [],
        config.maxDisplay || 24
    );

    const details = await Promise.all(names.map((name) => fetchRepoDetails(config.username, name)));
    const repos = details.filter(Boolean);

    const cards = renderReposToGrid(repos, grid);

    if (!repos.length) {
        setStatus("Curated project selection");
        return cards;
    }

    const readmeNote =
        readmeNames.length > 0
            ? `README links checked · ${readmeNames.length} pinned`
            : `GitHub links checked`;
    setStatus(`${readmeNote} · ${repos.length} repos`);

    return cards;
}

async function loadGithubProjects(options = {}) {
    const config = getGithubConfig();
    const grid = document.querySelector("[data-github-grid]");
    const statusEl = document.getElementById("github-load-status");

    if (!grid) return [];

    grid.innerHTML = "";
    grid.appendChild(createLoadingPlaceholder(6));

    const setStatus = (html) => {
        if (statusEl) statusEl.innerHTML = html;
    };

    try {
        const staticData = await fetchStaticRepos(Boolean(options.cacheBust));
        const preferStatic = config.preferStaticRepos !== false;
        const repos = staticData?.repos ?? [];
        const hasStatic = preferStatic && Array.isArray(repos) && repos.length > 0;

        if (hasStatic) {
            const cards = renderReposToGrid(repos, grid);
            const when = formatGeneratedDate(staticData.generated);
            setStatus(
                `GitHub Pages data` + (when ? ` · built ${when}` : "") + ` · ${repos.length} repos`
            );
            return cards;
        }

        if (config.allowLiveFetch) {
            setStatus("Checking GitHub links...");
            return loadGithubProjectsLive(config, grid, setStatus);
        }

        grid.innerHTML = "";
        setStatus("Curated project selection");
        return [];
    } catch (err) {
        console.error("GitHub projects:", err);
        grid.innerHTML = "";
        setStatus("Load failed");
        return [];
    }
}

window.loadGithubProjects = loadGithubProjects;
window.parseReposFromReadme = parseReposFromReadme;
window.categorizeRepo = categorizeRepo;

