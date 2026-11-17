"use strict";

const list = document.querySelector("#research-list");
const report = document.querySelector("#report-content");

function node(tag, content = "", className = "") {
  const element = document.createElement(tag);
  if (content) element.textContent = content;
  if (className) element.className = className;
  return element;
}

function localFile(path, extension) {
  if (typeof path !== "string" || !/^[A-Za-z0-9_. /-]+$/.test(path)) return "";
  const segments = path.split("/");
  if (segments.some(segment => !segment || segment === "." || segment === "..")) return "";
  if (!extension.test(path)) return "";
  return "./" + segments.map(encodeURIComponent).join("/");
}

function metadata(entry) {
  if (entry.sample) return "Sample research note";
  if (!entry.date || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)) return "";
  const date = new Date(entry.date + "T00:00:00Z");
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC"
  }).format(date);
}

function cover(entry, decorative = false) {
  const url = localFile(entry.cover, /\.(webp|jpe?g|png|avif)$/i);
  if (!url) return null;
  const img = node("img");
  img.src = url;
  img.alt = decorative ? "" : (entry.coverAlt || "");
  if (decorative) img.loading = "lazy";
  img.addEventListener("error", () => img.remove(), { once: true });
  return img;
}

function renderList(entries) {
  if (!entries.length) {
    list.replaceChildren(node("p", "Research notes will appear here when published.", "status"));
    return;
  }
  list.replaceChildren(...entries.map(entry => {
    const card = node("article", "", "research-card");
    const link = node("a");
    link.href = "./report.html?id=" + encodeURIComponent(entry.id);
    const image = cover(entry, true);
    if (image) link.append(image);
    const copy = node("div", "", "card-copy");
    const label = [entry.company, metadata(entry)].filter(Boolean).join(" · ");
    if (label) copy.append(node("p", label, "card-meta"));
    copy.append(node("h3", entry.title), node("p", entry.summary));
    link.append(copy);
    card.append(link);
    return card;
  }));
}

function renderReport(entry) {
  if (!entry) {
    report.replaceChildren(node("h1", "Research note not found"), node("p", "Use All research to browse published notes.", "status"));
    return;
  }
  document.title = entry.title + " | Project Orchid";
  const article = node("article");
  const hero = node("header", "", "report-hero");
  const heading = node("div");
  heading.append(node("h1", entry.title));
  if (entry.company) heading.append(node("p", entry.company, "report-company"));
  const label = metadata(entry);
  if (label) heading.append(node("p", label, "report-meta"));
  hero.append(heading);
  const image = cover(entry);
  if (image) hero.append(image);
  const body = node("section", "", "report-body");
  body.append(node("h2", "Research summary"), node("p", entry.summary));
  const pdf = localFile(entry.pdf, /\.pdf$/i);
  if (pdf) {
    const download = node("a", entry.sample ? "Download sample PDF" : "Download full report (PDF)", "button");
    download.href = pdf;
    download.setAttribute("download", "");
    const arrow = node("span", "↓");
    arrow.setAttribute("aria-hidden", "true");
    download.append(arrow);
    const view = node("a", "Open PDF", "report-secondary");
    view.href = pdf;
    view.target = "_blank";
    view.rel = "noopener";
    body.append(download, view);
  }
  article.append(hero, body);
  report.replaceChildren(article);
}

async function loadResearch() {
  const response = await fetch("./research.json", { cache: "no-cache" });
  if (!response.ok) throw new Error("Research could not be loaded");
  const entries = await response.json();
  if (!Array.isArray(entries)) throw new Error("Invalid research index");
  return entries.filter(entry => entry && typeof entry.id === "string" &&
    /^[a-z0-9-]+$/.test(entry.id) && typeof entry.title === "string" &&
    typeof entry.summary === "string")
    .sort((a, b) => Number(Boolean(a.sample)) - Number(Boolean(b.sample)) ||
      String(b.date || "").localeCompare(String(a.date || "")));
}

if (list || report) {
  loadResearch().then(entries => {
    if (list) renderList(entries);
    if (report) {
      const id = new URLSearchParams(location.search).get("id");
      renderReport(entries.find(entry => entry.id === id));
    }
  }).catch(() => {
    const message = location.protocol === "file:"
      ? "To load research, open the published site or preview it through a local web server."
      : "Research is temporarily unavailable. Please try refreshing the page.";
    (list || report).replaceChildren(node("p", message, "status"));
  });
}
