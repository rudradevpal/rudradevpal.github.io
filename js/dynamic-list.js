// === dynamic-list.js ===
// Lists .html files from /blogs or /tools directory using GitHub API or local fallback.

document.addEventListener("DOMContentLoaded", async () => {
  // Detect current directory (blogs or tools)
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
    // --- 1️⃣ Try GitHub API ---
    const hostname = window.location.hostname;
    const isGitHub = hostname.includes("github.io");

    if (isGitHub) {
      // Extract repo owner + repo name
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      const owner = pathParts[0];
      const repo = pathParts[0]; // same for user.github.io/repo
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

    // --- 2️⃣ Fallback for local testing ---
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

    // --- 3️⃣ Render the list ---
    renderList(files);

    // --- 🔍 Search Filter ---
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

  // --- Format File Names into Titles ---
  function formatTitle(name) {
    return name
      .replace(".html", "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }
});
