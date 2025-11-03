// === dynamic-list.js ===
// Fetches blog/tool .html file data (no rendering)

document.addEventListener("DOMContentLoaded", async () => {
  const thisScript =
    document.currentScript ||
    document.querySelector('script[src*="dynamic-list.js"]');

  const dir =
    thisScript?.getAttribute("data-dir") ||
    (window.location.pathname.includes("/tools/") ? "tools" : "blogs");

  try {
    const hostname = window.location.hostname;
    const isGitHub = hostname.endsWith("github.io");
    // const isGitHub = true; // Force GitHub fetch for testing

    let files = [];

    if (isGitHub) {
      // --- GitHub Pages API fetch ---
      const owner = hostname.split(".")[0];
      const pathnameParts = window.location.pathname.split("/").filter(Boolean);
      const repo =
        hostname === `${owner}.github.io`
          ? `${owner}.github.io`
          : pathnameParts[0];

      const apiURL = `https://api.github.com/repos/${owner}/${repo}/contents/${dir}`;
      // const apiURL = `https://api.github.com/repos/rudradevpal/rudradevpal.github.io/contents/${dir}`;
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
    } else {
      // --- Local server fallback ---
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

    // Expose globally
    window[`${dir}Data`] = files;
    console.log(`✅ Loaded ${files.length} ${dir}`);

    // Dispatch event so that renderer knows data is ready
    document.dispatchEvent(new CustomEvent(`${dir}Loaded`, { detail: files }));
  } catch (err) {
    console.error("Error loading list:", err);
  }

  function formatTitle(name) {
    return name
      .replace(".html", "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }
});
