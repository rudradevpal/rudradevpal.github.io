// === main.js ===
document.addEventListener("DOMContentLoaded", async () => {
  // Detect relative path depth (for nested folders)
  const depth = window.location.pathname.split("/").length - 2;
  const prefix = depth > 0 ? "../".repeat(depth) : "./";

  try {
    // Load the shared navbar HTML
    const response = await fetch(`${prefix}assets/components/navbar.html`);
    const html = await response.text();

    // Inject into the DOM
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    document.body.prepend(tempDiv);

    // Wait for DOM to update before running sidebar logic
    setTimeout(() => {
      lucide.createIcons();

      const sidebar = document.getElementById("sidebar");
      const toggleBtn = document.getElementById("toggleSidebar");
      const collapseBtn = document.getElementById("collapseBtn");

      if (!sidebar) {
        console.warn("Sidebar not found after injection.");
        return;
      }

      // === Mobile Sidebar Toggle ===
      toggleBtn?.addEventListener("click", () => {
        sidebar.classList.toggle("show");
      });

collapseBtn?.addEventListener("click", () => {
  const isCollapsed = sidebar.classList.toggle("collapsed");
  lucide.createIcons();

  const mainContent = document.querySelector(".main-content");
  if (mainContent) {
    mainContent.style.marginLeft = isCollapsed ? "80px" : "260px";
  }

  const username = sidebar.querySelector(".username");
  const subtitle = sidebar.querySelector(".subtitle");

  if (isCollapsed) {
    username?.classList.add("hidden");
    subtitle?.classList.add("hidden");
  } else {
    setTimeout(() => {
      username?.classList.remove("hidden");
      subtitle?.classList.remove("hidden");
    }, 150);
  }
});


      // === Close Sidebar When Clicking Outside (Mobile Only) ===
      document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
          sidebar.classList.remove("show");
        }
      });

      // === Active Link Highlighting ===
      const currentPath = window.location.pathname
        .replace(/\/$/, "")
        .replace("index.html", "");

      document.querySelectorAll(".nav-link").forEach((link) => {
        const linkPath = new URL(link.href).pathname
          .replace(/\/$/, "")
          .replace("index.html", "");

        link.classList.toggle("active", linkPath === currentPath);
      });
    }, 200); // ⏳ small delay ensures sidebar elements exist

  } catch (err) {
    console.error("Navbar load failed:", err);
  }
});
