// === dynamic-list.js ===
// Lists .html files from /blogs or /tools directory using GitHub API (with local fallback)

document.addEventListener("DOMContentLoaded", async () => {
  const thisScript =
    document.currentScript ||
    document.querySelector('script[src*="dynamic-list.js"]');

  const dir =
    thisScript?.getAttribute("data-dir") ||
    (window.location.pathname.includes("/tools/") ? "tools" : "blogs");

  const listContainer = document.getElementById(`${dir}List`);
  const searchInput = document.getElementById("searchBar");

  if (!listContainer) {
    console.warn(`⚠️ No list container found for "${dir}"`);
    return;
  }

  let files = [];
  const hostname = window.location.hostname;
  const isGitHub = hostname.endsWith("github.io");

  try {
    if (isGitHub) {
      // --- Detect owner + repo correctly ---
      const owner = hostname.split(".")[0]; // e.g. "rudradevpal"
      const pathnameParts = window.location.pathname.split("/").filter(Boolean);

      // CASE 1: user site (rudradevpal.github.io)
      // CASE 2: project site (rudradevpal.github.io/refynd/)
      const repo =
        hostname === `${owner}.github.io`
          ? `${owner}.github.io`
          : pathnameParts[0];

      const apiURL = `https://api.github.com/repos/${owner}/${repo}/contents/${dir}`;
      console.log("🔗 Fetching from GitHub API:", apiURL);

      const res = await fetch(apiURL);
      const data = await res.json();

      if (Array.isArray(data)) {
        files = data
          .filter(f => f.name.endsWith(".html") && f.name !== "index.html")
          .map(f => ({
            title: formatTitle(f.name),
            desc:
              dir === "blogs"
                ? "Read this article from Refynd’s blog collection."
                : "Try this tool built by Refynd.",
            file: f.name,
          }));
      } else {
        console.warn("⚠️ Unexpected API response:", data);
      }
    }

    // --- Fallback for local testing ---
    if (!files.length) {
      console.log("⚙️ Falling back to local directory scraping...");
      const res = await fetch(`../${dir}/`);
      const html = await res.text();
      const matches = [...html.matchAll(/href="([^"]+\.html)"/g)];
      files = matches
        .map(m => m[1])
        .filter(f => !f.includes("index.html"))
        .map(name => ({
          title: formatTitle(name),
          desc:
            dir === "blogs"
              ? "Read this article from Refynd’s blog collection."
              : "Try this tool built by Refynd.",
          file: name,
        }));
    }

    renderList(files);

    // --- Search Filter ---
    searchInput?.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      renderList(files.filter(f => f.title.toLowerCase().includes(q)));
    });
  } catch (err) {
    console.error("Error loading list:", err);
    listContainer.innerHTML = `<p style="color:#ccc;">⚠️ Unable to list ${dir}. Check console for details.</p>`;
  }

  // --- Render Cards ---
  function renderList(files) {
    listContainer.innerHTML = "";
    if (!files.length) {
      listContainer.innerHTML = `<p style="color:#aaa;">No ${dir} found.</p>`;
      return;
    }

    files.forEach(file => {
      const card = document.createElement("a");
      card.className = "card";
      card.href = `./${file.file}`;
      card.innerHTML = `
        <i data-lucide="${dir === "blogs" ? "file-text" : "wrench"}"></i>
        <h2>${file.title}</h2>
        <p>${file.desc}</p>
      `;
      listContainer.appendChild(card);
    });
    lucide.createIcons();
  }

  // --- Format File Names ---
  function formatTitle(name) {
    return name
      .replace(".html", "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }
});
