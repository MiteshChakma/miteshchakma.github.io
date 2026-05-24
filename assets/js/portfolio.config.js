/**
 * Portfolio settings — GitHub Pages loads assets/data/github-repos.json on deploy.
 *
 * Pin repos in profile README:
 *   <!-- portfolio-repos:start -->
 *   repo-name
 *   <!-- portfolio-repos:end -->
 *
 * Optional category override per repo (in pinnedRepos):
 *   { name: "my-repo", category: "backend" }
 */
window.PORTFOLIO_CONFIG = {
    projects: {
        maxPerTab: 3,
        tabs: ["research", "backend", "data-engineering", "miscellaneous"],
    },
    github: {
        username: "MiteshChakma",
        profileReadmeRepo: "MiteshChakma",
        readmeBranch: "master",
        excludeRepos: ["MiteshChakma"],
        maxDisplay: 30,
        includeFromReadme: true,
        includePublicRepos: true,
        sortBy: "updated",
        preferStaticRepos: true,
        allowLiveFetch: true,
        staticReposPath: "assets/data/github-repos.json",
    },
    pinnedRepos: [],
};
