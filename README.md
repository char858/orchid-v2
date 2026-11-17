# Project Orchid

This static site includes the animated homepage, investment philosophy, research library, and an example report page. It uses browser-based 3D and files hosted in the same repository. No build command or paid services are required.

## Publish on GitHub Pages

1. Sign in to GitHub and open [New repository](https://github.com/new).
2. Name it `project-orchid`, select **Public**, turn on **Add README**, then select **Create repository**.
3. Extract the downloaded ZIP. Open the extracted folder that contains `index.html`.
4. On the repository's **Code** tab, select **Add file → Upload files**. Drag in the contents of the extracted folder, including the `assets` and `reports` folders. GitHub should show `index.html` at the top level with paths like `assets/style.css`. The ZIP itself stays on your computer.
5. Under **Commit changes**, enter `Add Project Orchid website` and commit to `main`. If GitHub prompts you to make a pull request, merge it into `main`.
6. In the repository, open **Settings → Pages → Build and deployment**. Set **Source** to **Deploy from a branch**. Choose **main** and **/ (root)**, then select **Save**.
7. Wait for the deployment to finish. In **Settings → Pages**, select **Visit site** when it appears. The address will be `https://YOUR-USERNAME.github.io/project-orchid/`. GitHub says publishing changes can take up to 10 minutes.
8. On the live site, select **Explore the research**, open the Reysaş example, and select **Download sample PDF**.

The PDF and research entry supplied here are clearly labeled samples. Only upload reports, pictures, or other files you are comfortable making public. Keep private investor letters, financial records, and drafts outside the public repository.

## Publish your first research report

1. Export your full report from Word or Google Docs as a PDF. Name it with lowercase letters and hyphens, for example `my-company-report.pdf`.
2. On the GitHub **Code** tab, open the **reports** folder. Select **Add file → Upload files**, drop in the PDF, then commit to `main`.
3. Go back to the repository root. Open **research.json** and click the pencil icon. For your first real report, replace the entire sample entry by pasting this template over the file. Edit the values between the quotation marks. Keep a unique `id` in lowercase letters, numbers, and hyphens. The `pdf` path must match the uploaded file name exactly.

```json
[
  {
    "id": "my-company",
    "title": "Your report title",
    "company": "Your company name",
    "date": "2026-11-16",
    "summary": "Write two to four sentences on what you researched and what readers will find in the full report.",
    "pdf": "reports/my-company-report.pdf"
  }
]
```

4. Click **Commit changes** and commit to `main`. After Pages redeploys, the research card and page appear automatically. Open the page and click **Download full report (PDF)** to check the link.
5. Once the first real note is live, you can delete `reports/sample-research-report.pdf` if you no longer want the example file in the current site.

## Add or update another note

For another note, upload its PDF, then add a new entry to `research.json` inside the square brackets. Put a comma **between** entries and leave the final entry without a trailing comma. The newest dated reports appear first.

You can optionally upload a cover into `assets`. Add a comma after the `pdf` field, then add `"cover": "assets/my-cover.webp",` and `"coverAlt": "A brief description of the image"` before the entry's closing brace. JPEG, PNG, WebP, and AVIF covers are accepted. Upload only images you have permission to publish.

To correct a summary, edit its entry in `research.json`. To replace a PDF, upload the revised PDF to `reports` with the same name and commit. To edit the homepage intro or investment philosophy, open `index.html` and replace the text inside the relevant paragraph.

## Preview on your computer

The full site needs to be served over HTTP to load the research library. With Python installed, open a terminal in the folder containing `index.html`, run `python -m http.server 8000` (or `python3 -m http.server 8000`), then visit `http://localhost:8000`.

[GitHub Pages quickstart](https://docs.github.com/en/pages/quickstart) · [Adding a file to a repository](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
