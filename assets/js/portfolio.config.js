/**
 * Portfolio settings.
 * The public site uses curated static project cards and avoids live GitHub API calls.
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
        includeFromReadme: false,
        includePublicRepos: false,
        sortBy: "updated",
        preferStaticRepos: true,
        allowLiveFetch: false,
        staticReposPath: "assets/data/github-repos.json",
    },
    pinnedRepos: [],
};
