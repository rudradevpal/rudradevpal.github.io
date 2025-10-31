/* =====================================================
   Liquid Glass JS Framework v2
   Adds: Sidebar, Footer, Icons, Popup, Nav controls
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const config = window.LG_PROFILE || {
    name: "Your Name",
    github: "https://github.com/yourusername",
    linkedin: "https://linkedin.com/in/yourusername",
    photo: "https://github.com/yourusername.png",
    sidebar: [
      { name: "Tools", icon: "wrench", link: "./tools.html" },
      { name: "Blogs", icon: "book-open-text", link: "./blogs.html" },
      { name: "Documents", icon: "file-text", link: "./docs.html" },
      { name: "About", icon: "user", link: "./about.html" }
    ]
  };

  // ✅ Create Sidebar
  if (!document.querySelector(".sidebar")) {
    const sidebar = document.createElement("aside");
    sidebar.className = "sidebar";

    const linksHTML = config.sidebar
      .map(
        (item) => `
        <a href="${item.link}" class="nav-link">
          <i data-lucide="${item.icon}"></i> ${item.name}
        </a>`
      )
      .join("");

    sidebar.innerHTML = `
      <div>
        <h2>Liquid Glass</h2>
        <nav class="nav-links">${linksHTML}</nav>
      </div>
      <div class="nav-footer">© ${new Date().getFullYear()} ${config.name}</div>
    `;
    document.body.prepend(sidebar);
  }

  // ✅ Add default structure if missing
  if (!document.querySelector(".main")) {
    const wrapper = document.createElement("div");
    wrapper.className = "main";
    const card = document.querySelector(".card") || document.createElement("div");
    card.classList.add("card");
    wrapper.appendChild(card);
    document.body.appendChild(wrapper);
  }

  // ✅ Auto footer (if not in HTML)
  if (!document.querySelector("footer")) {
    const footerHTML = `
      <footer>
        Made with ❤️ by <span id="author">${config.name}</span>
        <div class="popup" id="popup">
          <img id="profileImg" src="${config.photo}" alt="Profile" />
          <h3 id="profileName">${config.name}</h3>
          <a id="profileGit" href="${config.github}" target="_blank">
            <i data-lucide="github"></i> GitHub
          </a>
          <a id="profileLinked" href="${config.linkedin}" target="_blank">
            <i data-lucide="linkedin"></i> LinkedIn
          </a>
        </div>
      </footer>`;
    document.querySelector(".card").insertAdjacentHTML("beforeend", footerHTML);
  }

  // ✅ Icon rendering
  if (window.lucide && window.lucide.createIcons) lucide.createIcons();

  // ✅ Popup logic
  const author = document.getElementById("author");
  const popup = document.getElementById("popup");
  if (author && popup) {
    author.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.classList.toggle("active");
    });
    document.addEventListener("click", (e) => {
      if (!popup.contains(e.target) && e.target !== author) popup.classList.remove("active");
    });
  }

  // ✅ Top icons (home/share) logic
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn)
    homeBtn.addEventListener("click", () => (window.location.href = "./"));

  const shareBtn = document.getElementById("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const url = window.location.href;
      try {
        if (navigator.share) await navigator.share({ title: document.title, url });
        else {
          await navigator.clipboard.writeText(url);
          alert("🔗 Link copied!");
        }
      } catch (err) {
        console.log("Share cancelled", err);
      }
    });
  }
});
