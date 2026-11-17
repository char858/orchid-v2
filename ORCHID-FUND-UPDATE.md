# Orchid Fund website update

Upload the 11 extracted files to the top level of the existing purple-orchid site on GitHub. The new homepage loads the existing orchid image, animation, and stylesheet from the repository's `assets` folder.

1. Extract the ZIP.
2. In the GitHub repository, select **Code → Add file → Upload files**. Select the 11 extracted files and commit to `main`.
3. When the Pages deployment is green, refresh the live site and try all five tabs. On **Letters**, click **Download letter (PDF)**.

The site excludes the old Reysaş sample from the Research listings and detail pages. To remove the raw PDF from the current repository and published files, delete `reports/sample-research-report.pdf` and any duplicate `sample-research-report.pdf` at the top level. You can also remove its sample entry from `research.json`.

## Updating content

- **About and contact** — Edit `about.html`. Replace the Contact placeholder with a public email link or other contact method you want visitors to use.
- **Holdings** — Edit `holdings.html` with the holdings you want to publish and an as-of date.
- **Research** — Add entries to `research.json`. For example, upload `company-report.pdf` at the top level, then add its entry to the JSON array.

```json
[
  {
    "id": "company-report",
    "title": "Your report title",
    "company": "Your company name",
    "date": "2026-11-17",
    "summary": "A short description of your research.",
    "pdf": "company-report.pdf"
  }
]
```

- **Letters** — Upload a new PDF and add another letter entry in `letters.html`.
- **Resources** — Edit the links in `resources.html`.
