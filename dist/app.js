"use strict";
const menu = document.querySelector("#menu");
document.querySelector(".menu-open")?.addEventListener("click", () => {
  menu.showModal();
  document.body.style.overflow = "hidden";
});
function closeMenu() {
  menu.close();
  document.body.style.overflow = "";
}
document.querySelector(".menu-close")?.addEventListener("click", closeMenu);
menu?.addEventListener("close", () => {
  document.body.style.overflow = "";
});
let saved = new Set();
try {
  const values = JSON.parse(localStorage.getItem("sb-saved") || "[]");
  if (Array.isArray(values))
    saved = new Set(values.filter((v) => typeof v === "string"));
} catch {}
function saveState() {
  try {
    localStorage.setItem("sb-saved", JSON.stringify([...saved]));
  } catch {}
  document.querySelectorAll("[data-save]").forEach((b) => {
    const active = saved.has(b.dataset.save);
    b.setAttribute("aria-pressed", String(active));
    b.textContent = active
      ? "Saved"
      : b.classList.contains("wide")
        ? "Save property"
        : "Save";
  });
}
document.querySelectorAll("[data-save]").forEach((b) =>
  b.addEventListener("click", () => {
    saved.has(b.dataset.save)
      ? saved.delete(b.dataset.save)
      : saved.add(b.dataset.save);
    saveState();
    filterHomes();
  }),
);
saveState();
const params = new URLSearchParams(location.search),
  filters = document.querySelector("#filters");
if (filters) {
  for (const key of ["area", "max", "type", "sort"]) {
    const el = filters.elements.namedItem(key);
    if (
      params.has(key) &&
      [...el.options].some((o) => o.value === params.get(key))
    )
      el.value = params.get(key);
  }
  document.querySelector("#saved-only").checked = params.get("saved") === "1";
  filters.addEventListener("submit", (e) => {
    e.preventDefault();
    filterHomes(true);
  });
  document
    .querySelector("#saved-only")
    .addEventListener("change", () => filterHomes(true));
  document.querySelector(".reset").addEventListener("click", () => {
    filters.reset();
    document.querySelector("#saved-only").checked = false;
    filterHomes(true);
  });
}
function filterHomes(updateUrl = false) {
  if (!filters) return;
  const area = filters.elements.area.value,
    max = Number(filters.elements.max.value) || Infinity,
    type = filters.elements.type.value,
    sort = filters.elements.sort.value,
    onlySaved = document.querySelector("#saved-only").checked;
  const grid = document.querySelector("#property-results"),
    cards = [...grid.children];
  if (!cards[0]?.dataset.order)
    cards.forEach((c, i) => (c.dataset.order = String(i + 1)));
  cards.sort((a, b) =>
    sort === "low"
      ? Number(a.dataset.price) - Number(b.dataset.price)
      : sort === "high"
        ? Number(b.dataset.price) - Number(a.dataset.price)
        : Number(a.dataset.order) - Number(b.dataset.order),
  );
  let count = 0;
  cards.forEach((c) => {
    const visible =
      (!area || c.dataset.area === area) &&
      Number(c.dataset.price) <= max &&
      (!type || c.dataset.type === type) &&
      (!onlySaved || saved.has(c.dataset.id));
    c.hidden = !visible;
    if (visible) count++;
    grid.append(c);
  });
  document.querySelector("#result-count").textContent =
    `${count} sample ${count === 1 ? "home" : "homes"}`;
  document.querySelector("#empty-results").hidden = count !== 0;
  if (updateUrl) {
    const q = new URLSearchParams();
    for (const key of ["area", "max", "type", "sort"]) {
      const v = filters.elements.namedItem(key).value;
      if (v && v !== "featured") q.set(key, v);
    }
    if (onlySaved) q.set("saved", "1");
    history.replaceState(
      null,
      "",
      location.pathname + (q.size ? "?" + q.toString() : ""),
    );
  }
}
filterHomes();
const form = document.querySelector("#enquiry-form");
let enquiry = "";
if (form) {
  for (const k of ["interest", "community"]) {
    const field = form.elements.namedItem(k);
    if (params.has(k)) {
      if (k === "community") field.value = params.get(k).slice(0, 100);
      else if ([...field.options].some((o) => o.value === params.get(k)))
        field.value = params.get(k);
    }
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    enquiry = `Hello Samantha,\n\n${d.get("message").trim()}\n\nName: ${d.get("name").trim()}\nEmail: ${d.get("email").trim()}\nInterested in: ${form.elements.interest.selectedOptions[0].textContent}\nCommunity: ${d.get("community").trim() || "Still deciding"}\nTimeline: ${d.get("timeline")}\n\nPrepared using the Samantha Bender website concept. Not submitted.`;
    document.querySelector("#draft-text").textContent = enquiry;
    document.querySelector("#draft").hidden = false;
    document.querySelector("#draft-status").textContent =
      "Draft ready. Nothing has been sent.";
    document
      .querySelector("#draft")
      .scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "center",
      });
  });
}
document.querySelector("#copy-draft")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(enquiry);
    document.querySelector("#draft-status").textContent = "Enquiry copied.";
  } catch {
    document.querySelector("#draft-status").textContent =
      "Copy is unavailable in this browser. Select the text above or download it.";
  }
});
document.querySelector("#download-draft")?.addEventListener("click", () => {
  const url = URL.createObjectURL(
      new Blob([enquiry], { type: "text/plain;charset=utf-8" }),
    ),
    a = document.createElement("a");
  a.href = url;
  a.download = "my-home-enquiry.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector("#draft-status").textContent =
    "Your draft has been downloaded. Nothing has been sent.";
});
document.querySelector("#clear-saved")?.addEventListener("click", () => {
  saved.clear();
  saveState();
  document.querySelector("#privacy-status").textContent =
    "Your saved homes have been cleared.";
});
