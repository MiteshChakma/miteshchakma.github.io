# Mitesh Chakma Portfolio

Personal portfolio website for [miteshchakma.github.io](https://miteshchakma.github.io), built as a static GitHub Pages site.

The site presents my work across data engineering, backend systems, AI workflows, analytics-oriented engineering, and geospatial research. It is designed to work without npm, build tools, or a backend service.

## Overview

This portfolio highlights:

- Professional summary and current career focus
- Technical stack for backend, data, cloud, and AI workflows
- Experience across AI training, software engineering, data operations, and research
- Selected projects and publications
- Embedded resume view
- Contact section
- Static visitor dashboard at [`/visitors/`](https://miteshchakma.github.io/visitors/)

## Technologies

The site is intentionally simple and GitHub Pages friendly:

- HTML5
- CSS3
- Vanilla JavaScript
- Static image and SVG assets
- GitHub Pages hosting

No npm packages, bundlers, or server-side runtime are required.

## Project Structure

```text
.
+-- index.html              # Main portfolio page
+-- visitors/
|   +-- index.html          # Static visitor dashboard
+-- assets/
|   +-- css/                # Site styling
|   +-- img/                # Profile, project, and technology assets
|   +-- js/                 # Vanilla JavaScript for interactions
|   +-- resume/             # Resume-related assets
+-- scripts/                # Optional maintenance scripts
+-- .github/                # GitHub workflow/config files
+-- README.md
```

## Visitor Dashboard

The `/visitors/` page uses a static JavaScript dictionary for daily, weekly, and monthly visitor values. This keeps the page compatible with GitHub Pages and avoids any database requirement.

Because GitHub Pages is static hosting, the dashboard does not automatically collect global visitor counts by itself. The numbers can be updated manually or generated into the static data object later.

## Local Preview

Because the site is static, it can be opened directly in a browser:

```text
index.html
visitors/index.html
```

For GitHub Pages behavior, publish the repository and visit:

- [https://miteshchakma.github.io](https://miteshchakma.github.io)
- [https://miteshchakma.github.io/visitors/](https://miteshchakma.github.io/visitors/)

## Contact

For opportunities, collaboration, or feedback, use the contact section on the portfolio:

[miteshchakma.github.io/#connect](https://miteshchakma.github.io/#connect)
