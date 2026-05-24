#!/usr/bin/env python3
"""
Build assets/data/github-repos.json for static GitHub Pages hosting.
Runs in GitHub Actions on deploy — no npm required on the live site.
"""
from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

USERNAME = os.environ.get("GITHUB_USERNAME", "MiteshChakma")
PROFILE_REPO = os.environ.get("GITHUB_PROFILE_REPO", USERNAME)
README_BRANCH = os.environ.get("GITHUB_README_BRANCH", "master")
EXCLUDE = {x.strip().lower() for x in os.environ.get("GITHUB_EXCLUDE_REPOS", "MiteshChakma").split(",")}
MAX_REPOS = int(os.environ.get("GITHUB_MAX_REPOS", "24"))
PINNED = [x.strip() for x in os.environ.get("GITHUB_PINNED_REPOS", "").split(",") if x.strip()]
OUT = Path(__file__).resolve().parent.parent / "assets" / "data" / "github-repos.json"


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"Accept": "application/vnd.github+json", "User-Agent": "portfolio-pages-build"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def fetch_readme() -> str:
    url = f"https://raw.githubusercontent.com/{USERNAME}/{PROFILE_REPO}/{README_BRANCH}/README.md"
    try:
        return fetch(url).decode("utf-8", errors="replace")
    except urllib.error.URLError:
        return ""


def parse_readme_names(markdown: str) -> list[str]:
    names: list[str] = []
    block = re.search(
        r"<!--\s*portfolio-repos:start\s*-->([\s\S]*?)<!--\s*portfolio-repos:end\s*-->",
        markdown,
        re.I,
    )
    if block:
        for line in block.group(1).splitlines():
            line = re.sub(r"^[-*]\s*", "", line.strip())
            if not line:
                continue
            m = re.search(r"github\.com/[^/]+/([\w.-]+)", line, re.I)
            names.append(m.group(1) if m else line.split("/")[-1])

    for m in re.finditer(rf"github\.com/{re.escape(USERNAME)}/([\w.-]+)", markdown, re.I):
        if m.group(1).lower() != USERNAME.lower():
            names.append(m.group(1))

    return names


def fetch_api_repo_names() -> list[str]:
    url = f"https://api.github.com/users/{USERNAME}/repos?per_page=100&sort=updated"
    try:
        data = json.loads(fetch(url).decode())
    except urllib.error.URLError:
        return []
    return [
        r["name"]
        for r in data
        if not r.get("fork") and r.get("name", "").lower() not in EXCLUDE
    ]


def merge_names(readme_names: list[str], api_names: list[str]) -> list[str]:
    ordered: list[str] = []
    seen: set[str] = set()

    def add(name: str) -> None:
        key = name.lower()
        if not name or key in seen or key in EXCLUDE:
            return
        seen.add(key)
        ordered.append(name)

    for n in PINNED:
        add(n)
    for n in readme_names:
        add(n)
    for n in api_names:
        add(n)

    return ordered[:MAX_REPOS]


def fetch_repo(name: str) -> dict | None:
    url = f"https://api.github.com/repos/{USERNAME}/{name}"
    try:
        return json.loads(fetch(url).decode())
    except urllib.error.URLError:
        return None


def categorize_repo(repo: dict) -> str:
    topics = [t.lower() for t in repo.get("topics") or []]
    blob = " ".join(
        topics
        + [
            (repo.get("language") or "").lower(),
            (repo.get("description") or "").lower(),
            (repo.get("name") or "").lower(),
        ]
    )
    research_kw = ("gis", "remote", "satellite", "land cover", "urban", "tensorflow", "ecology", "mangrove")
    backend_kw = ("django", "flask", "fastapi", "backend", "rest api", "restful", "nginx", "mobile", "postgres")
    data_kw = ("data", "etl", "pipeline", "spark", "pandas", "llm", "nlp", "prompt", "pyspark", "mlops", "airflow")

    if any(k in blob for k in research_kw) and not any(k in blob for k in backend_kw):
        return "research"
    if any(k in blob for k in data_kw):
        return "data-engineering"
    if any(k in blob for k in backend_kw):
        return "backend"
    return "miscellaneous"


def slim_repo(repo: dict) -> dict:
    pushed = repo.get("pushed_at") or ""
    sort_key = pushed[:10].replace("-", "") if pushed else "00000000"
    return {
        "name": repo.get("name"),
        "description": repo.get("description"),
        "html_url": repo.get("html_url"),
        "homepage": repo.get("homepage"),
        "language": repo.get("language"),
        "stargazers_count": repo.get("stargazers_count", 0),
        "forks_count": repo.get("forks_count", 0),
        "pushed_at": pushed,
        "sort": sort_key,
        "category": categorize_repo(repo),
        "topics": repo.get("topics") or [],
    }


def main() -> int:
    readme = fetch_readme()
    readme_names = parse_readme_names(readme)
    api_names = fetch_api_repo_names()
    names = merge_names(readme_names, api_names)

    repos = []
    for name in names:
        repo = fetch_repo(name)
        if repo:
            repos.append(slim_repo(repo))

    payload = {
        "generated": datetime.now(timezone.utc).isoformat(),
        "username": USERNAME,
        "source": "readme+api" if readme_names else "api",
        "readmeRepoCount": len(readme_names),
        "repos": repos,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {len(repos)} repos to {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
