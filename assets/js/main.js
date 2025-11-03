// === main.js ===
document.addEventListener("DOMContentLoaded", async () => {
  // Detect relative path depth (for nested folders)
  const depth = window.location.pathname.split("/").length - 2;
  const prefix = depth > 0 ? "../".repeat(depth) : "./";

  try {
    // Load the shared navbar
    const response = await fetch(`${prefix}assets/components/navbar.html`);
    const html = await response.text();

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    document.body.prepend(tempDiv);
    lucide.createIcons();

    const sidebar = document.getElementById("sidebar");
    const toggleBtn = document.getElementById("toggleSidebar");
    const collapseBtn = document.getElementById("collapseBtn");

    if (toggleBtn) toggleBtn.addEventListener("click", () => sidebar.classList.toggle("show"));
    if (collapseBtn) collapseBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      lucide.createIcons();
    });

    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) sidebar.classList.remove("show");
    });

    // ✅ Improved Active Link Logic
    const currentPath = window.location.pathname
      .replace(/\/$/, "") // remove trailing slash
      .replace("index.html", ""); // treat / and /index.html as same

    document.querySelectorAll(".nav-link").forEach((link) => {
      const linkPath = new URL(link.href).pathname
        .replace(/\/$/, "")
        .replace("index.html", "");

      if (linkPath === currentPath) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

  } catch (err) {
    console.error("Navbar load failed:", err);
  }
});
