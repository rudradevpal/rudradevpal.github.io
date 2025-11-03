// === dynamic-list.js ===
// Lists .html files from /blogs or /tools directory using GitHub API or local fallback.

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

  try {
    const hostname = window.location.hostname;
    const isGitHub = hostname.includes("github.io");

    if (isGitHub) {
      // --- Detect correct owner/repo pattern ---
      const owner = hostname.split(".")[0]; // "rudradevpal"
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      let repo;

      if (hostname === `${owner}.github.io`) {
        // User page (repo = username.github.io)
        repo = `${owner}.github.io`;
      } else {
        // Project page (repo = first part of path)
        repo = pathParts[0];
      }

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

    // Search
    searchInput?.addEventListener("input", e => {
      const q = e.target.value.toLowerCase();
      renderList(files.filter(f => f.title.toLowerCase().includes(q)));
    });
  } catch (err) {
    console.error("Error loading list:", err);
    listContainer.innerHTML = `<p style="color:#ccc;">⚠️ Unable to list ${dir}. Check console for details.</p>`;
  }

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

  function formatTitle(name) {
    return name
      .replace(".html", "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }
});
