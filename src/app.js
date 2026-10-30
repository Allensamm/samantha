const menu = document.querySelector(".menu-toggle");
const nav = document.querySelector("#navigation");
menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  nav.classList.toggle("open", open);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("open")) {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    menu.focus();
  }
});
document.addEventListener("click", (event) => {
  if (
    nav?.classList.contains("open") &&
    !event.target.closest(".site-header")
  ) {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
  }
});
for (const group of document.querySelectorAll("[data-filter-group]")) {
  const kind = group.dataset.filterGroup;
  const grid = document.getElementById(kind);
  const cards = [...grid.children];
  let filter = "all";
  const search = document.getElementById("article-search");
  function update() {
    const query = search?.value.trim().toLowerCase() || "";
    let count = 0;
    for (const card of cards) {
      const match =
        (filter === "all" ||
          (card.dataset.category || card.dataset.type) === filter) &&
        (!query || card.dataset.title?.includes(query));
      card.hidden = !match;
      if (match) count++;
    }
    const results = document.querySelector(".results-count");
    if (results)
      results.textContent = `${count} ${count === 1 ? "story" : "stories"}`;
    const empty = document.querySelector(".empty-state");
    if (empty) empty.hidden = count > 0;
  }
  group.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    filter = button.dataset.filter;
    for (const b of group.querySelectorAll("button")) {
      b.classList.toggle("active", b === button);
      b.setAttribute("aria-pressed", String(b === button));
    }
    update();
  });
  search?.addEventListener("input", update);
  document
    .querySelector("[data-reset-search]")
    ?.addEventListener("click", () => {
      search.value = "";
      group.querySelector('[data-filter="all"]').click();
      search.focus();
    });
}
for (const stage of document.querySelectorAll("[data-youtube]"))
  stage.querySelector("button")?.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(stage.dataset.youtube)}?autoplay=1&rel=0`;
    iframe.title = stage.dataset.videoTitle;
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    stage.replaceChildren(iframe);
  });
document
  .querySelector("[data-print]")
  ?.addEventListener("click", () => window.print());
document.querySelector("[data-share]")?.addEventListener("click", async () => {
  const status = document.querySelector(".share-status");
  try {
    await navigator.clipboard.writeText(window.location.href);
    status.textContent = "Link copied.";
  } catch {
    status.textContent =
      "Copy this page’s address from your browser to share this story.";
  }
});
document.querySelector("#contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = String(data.get("subject")).trim();
  const body = `${String(data.get("message")).trim()}\n\nFrom: ${String(data.get("name")).trim()}\nReply to: ${String(data.get("email")).trim()}`;
  const draft = document.createElement("a");
  draft.href = `mailto:samanthabendertv@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  draft.target = "_blank";
  draft.rel = "noopener";
  document.body.append(draft);
  draft.click();
  draft.remove();
  document.getElementById("form-status").textContent =
    "Your email app will open a draft. Please review and send it there. If it does not open, email samanthabendertv@gmail.com directly.";
});
