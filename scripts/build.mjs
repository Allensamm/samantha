import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import path from "node:path";
const site = JSON.parse(await readFile("content/site.json", "utf8"));
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const pretty = {
  "copy-of-travel-blog": "podcast",
  "copy-of-documentary": "magazine",
  "copy-of-in-context-podcast": "uk-collaboration",
  "copy-of-u-k-collaboration": "documentary",
  "news-package": "news-packages",
  "news-package-1": "coronavirus-alters-easter-plans",
  "copy-of-cscu-makes-budget-cuts-to-s": "spring-semester",
};
const route = (p) => "/" + (pretty[p] || p) + "/";
const arrow = '<span aria-hidden="true">↗</span>';
const label = (t) => `<span class="eyebrow">${t}</span>`;
const button = (href, text, style = "") =>
  `<a class="button ${style}" href="${href}">${text} ${arrow}</a>`;
const image = (src, alt, cls = "", eager = false) =>
  src?.endsWith("#portrait")
    ? `<div class="portrait-crop ${cls}"><img src="${esc(src.split("#")[0])}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" ${eager ? 'fetchpriority="high"' : ""}></div>`
    : src
      ? `<img src="${esc(src)}" alt="${esc(alt)}" class="${cls}" loading="${eager ? "eager" : "lazy"}" ${eager ? 'fetchpriority="high"' : ""}>`
      : "";
const projects = site.projects;
const find = (p) => projects.find((x) => x.path === p);
const pimage = (p) =>
  p.image || (p.path === "reporter-reel" ? site.portrait : "");
const projectArtwork = (p) =>
  `<div class="project-art ${p.category === "Documentary" ? "film-art" : ""}"><span class="eyebrow">${esc(p.category)} / SAMANTHA BENDER</span><h3>${p.category === "Documentary" ? "The Covid<br><em>Generation.</em>" : esc(p.title)}</h3><span class="art-star" aria-hidden="true">✺</span><span class="art-credit">STORIES WITH A HUMAN PERSPECTIVE</span></div>`;
const projectCard = (p, index = 0) =>
  `<a class="project-card" data-category="${p.category === "News package" || p.path === "reporter-reel" ? "broadcast" : p.category === "Documentary" ? "film" : "digital"}" href="${route(p.path)}"><div class="card-image">${pimage(p) ? image(pimage(p), p.title) : projectArtwork(p)}<span class="image-link" aria-hidden="true">${p.video ? "▷" : "↗"}</span></div><div class="card-meta"><span>${esc(p.category)}</span><span>${String(index + 1).padStart(2, "0")}</span></div><h3>${esc(p.title)} ${arrow}</h3></a>`;
const articleCard = (a) =>
  `<article class="article-card" data-type="${a.category.toLowerCase()}" data-title="${esc(a.title.toLowerCase())}"><a href="/${a.path}/"><div class="article-image">${a.image ? image(a.image, a.title) : `<div class="typographic-cover">${esc(a.coverLabel || "A closer look.").replace(" / ", "<br><em>")}${(a.coverLabel || "").includes(" / ") ? "</em>" : ""}<span>SB / THE RECORDER / ${String(site.articles.indexOf(a) + 1).padStart(2, "0")}</span></div>`}${arrow}</div><div class="card-meta"><span>${a.category}</span><time>${esc(a.date)}</time></div><h3>${esc(a.title)}</h3><p>${esc(a.excerpt.slice(0, 145))}…</p><span class="text-link">Read story <span aria-hidden="true">↗</span></span></a></article>`;
const socials = `<a href="https://linkedin.com/in/samanthabender5" target="_blank" rel="noopener noreferrer">LinkedIn ${arrow}</a><a href="https://twitter.com/sbender99" target="_blank" rel="noopener noreferrer">Twitter ${arrow}</a><a href="https://facebook.com/samantha.bender.923" target="_blank" rel="noopener noreferrer">Facebook ${arrow}</a>`;
function header(current) {
  return `<a class="skip-link" href="#main">Skip to content</a><header class="site-header"><a class="wordmark" href="/" aria-label="Samantha Bender home">Samantha Bender<span>.</span></a><button class="menu-toggle" aria-expanded="false" aria-controls="navigation"><span>Menu</span><i aria-hidden="true"></i></button><nav id="navigation" aria-label="Main navigation"><a href="/work/" ${current === "work" ? 'aria-current="page"' : ""}>Selected work</a><a href="/about/" ${current === "about" ? 'aria-current="page"' : ""}>About</a><a href="/articles/" ${current === "articles" ? 'aria-current="page"' : ""}>Articles</a><a href="/resume/" ${current === "resume" ? 'aria-current="page"' : ""}>Résumé</a><a class="nav-contact" href="/contact/">Let’s connect ${arrow}</a></nav></header>`;
}
function footer() {
  return `<section class="contact-band"><div>${label("GOOD STORIES START WITH A CONVERSATION")}<h2>Let’s tell the<br><em>next story.</em></h2></div><a class="round-link" href="/contact/" aria-label="Get in touch">↗</a></section><footer class="site-footer"><div class="footer-top"><a class="wordmark" href="/">Samantha Bender<span>.</span></a><p>Journalism with curiosity.<br>Stories with a human perspective.</p><a class="email-link" href="mailto:samanthabendertv@gmail.com">Say hello ${arrow}</a></div><div class="footer-links"><div>${label("EXPLORE")}<a href="/reporter-reel/">Reporter reel</a><a href="/news-packages/">News packages</a><a href="/articles/">Articles</a><a href="/travel-blog/">Travel blog</a></div><div>${label("MORE STORIES")}<a href="/podcast/">Podcast</a><a href="/uk-collaboration/">U.K. collaboration</a><a href="/documentary/">Documentary</a><a href="/magazine/">Magazine</a></div><div>${label("GET TO KNOW ME")}<a href="/about/">About Samantha</a><a href="/resume/">Résumé</a><a href="/contact/">Contact</a><a href="/about/#education">Education</a></div><div>${label("ELSEWHERE")}${socials}</div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Samantha Bender</span><span>Multimedia journalist · Reporter & storyteller</span><a href="#top">Back to top ↑</a></div></footer>`;
}
function shell(
  title,
  body,
  current = "",
  description = "The work and stories of Samantha Bender, a multimedia journalist with a passion for reporting, digital storytelling, and giving others a voice.",
) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f5f3ed"><title>${esc(title)} — Samantha Bender</title><meta name="description" content="${esc(description.slice(0, 160))}"><meta property="og:title" content="${esc(title)} — Samantha Bender"><meta property="og:description" content="${esc(description.slice(0, 160))}"><meta property="og:type" content="website"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/fonts.css"><link rel="stylesheet" href="/style.css"><script src="/app.js" defer></script></head><body id="top">${header(current)}<main id="main">${body}</main>${footer()}</body></html>`;
}
const sectionHead = (k, t, href = "", text = "Explore all work") =>
  `<div class="section-heading"><div>${label(k)}<h2>${t}</h2></div>${href ? `<a class="text-link" href="${href}">${text} ${arrow}</a>` : ""}</div>`;
const intro = `Creative and driven journalist with a nose for the truth. Adept at digital storytelling and the ability to meet deadlines. Excellent track record of working efficiently under pressure and dynamic story pitching.`;
const biography = [
  intro,
  `My time as news editor of The Recorder, especially in these unique virtual times, has allowed me to hone in on my communication and leadership skills. With a long-standing record of initiative and innovation, I am eager to bring new ideas into the newsroom. My experience producing and reporting for “CCSU News” has helped me to nurture my passion for enterprising and stacking stories.`,
  `I am a hungry and ambitious individual looking to better myself both professionally and personally. I believe everyone has a unique story to tell and it is my goal that I can help give others a voice through my reporting.`,
];
const archivedExperience = [
  {
    title: "News Editor",
    org: "The Recorder · Central Connecticut State University",
    date: "08/2020 – Current¹",
    items: [
      "Responsible for collaborating and coordinating with other staff writers and contributing a story idea list each week.",
      "Curate and edit content in the news and opinion section.",
      "Evaluate all stories for authenticity and check with sources to ensure correctness of published articles.",
    ],
  },
  {
    title: "Assistant News Editor",
    org: "The Recorder · Central Connecticut State University",
    date: "01/2020 – 05/2020",
    items: [
      "Assist in curating and editing content in the news and opinion section.",
      "Responsible for writing articles relevant to the news and opinion section.",
      "Responsible for contributing story ideas and collaborating with other staff writers.",
    ],
  },
  {
    title: "Disney College Program Vacation Planner",
    org: "Walt Disney World Resort · Orlando, FL",
    date: "01/2019 – 05/2019",
    items: [
      "Gained valuable, on-the-job experience working in the parks and resorts.",
      "Unique five month program that allowed me to network with leaders, take part in personal and career development classes, and build transferrable skills such as problem-solving, teamwork, guest service and effective communication.",
      "Participated in four week seminar in Leadership and Communications.",
    ],
  },
  {
    title: "Recruiting Manager",
    org: "Vector Marketing · 50 Stanford Dr., Farmington, CT",
    date: "04/2017 – Current¹",
    items: [
      "Handle hundreds of incoming / outgoing recruiting calls.",
      "Manage district manager’s schedule, and provide help to applicants.",
      "Interview applicants to determine whether they’re a good fit for the position.",
    ],
  },
];
const archivedEducation = [
  {
    title: "Central Connecticut State University",
    org: "1615 Stanley St. · New Britain, CT",
    date: "2017 – Current¹",
    items: [
      "Honors Program · Dean’s List every semester · President’s List Spring 2020 · 3.77 GPA",
      "Assistant News Editor & News Editor for campus newspaper",
      "Treasurer for the Society of Professional Journalists",
      "Producer & Reporter for “CCSU News”",
    ],
  },
  {
    title: "Bristol Eastern High School",
    org: "632 King St. · Bristol, CT",
    date: "2013 – 2017",
    items: [
      "Honors student · Top 10% of class",
      "Varsity softball & volleyball",
      "Spanish National Honor Society · Secretary of Spanish Club",
      "Staff writer for school newspaper",
    ],
  },
];
const experience = [
  {
    title: "Multimedia Journalist / Weekend Morning Anchor",
    org: "WKBN News · Youngstown, OH",
    date: "2021 – Current¹",
    items: [
      "Deliver live reports multiple times a week.",
      "Respond to emergencies and breaking news stories with a strong sense of urgency, at any hour of the day.",
      "Identify and secure multiple information sources for each story to provide accurate, credible news coverage.",
      "Enterprise and pitch story ideas.",
      "Perform special projects and other duties as assigned.",
      "Shoot, write, and edit stories.",
    ],
  },
  {
    title: "News Editor",
    org: "The Recorder · Central Connecticut State University",
    date: "2020 – 2021",
    items: [
      "Curated and edited content in the news and opinion sections.",
      "Evaluated all stories for their authenticity and checked sources to ensure correctness of articles.",
    ],
  },
  {
    title: "Producer / Reporter / Anchor",
    org: "Central Connecticut State University · New Britain, CT",
    date: "2020 – 2021",
    items: [
      "Planned and stacked stories within deadline.",
      "Talked to sources, followed up on leads, researched and enterprised stories.",
    ],
  },
];
const education = [
  {
    title: "Central Connecticut State University",
    org: "Bachelor’s Degree in Journalism · Magna Cum Laude",
    date: "2017 – 2021",
    items: [
      "Honors Program",
      "Producer and Reporter for “CCSU News”",
      "News Editor for The Recorder",
      "Treasurer for the Society of Professional Journalists",
      "Contributed to campus podcast “In Context”",
    ],
  },
];
const awards = [
  "CCSU Journalism Department 2021 Department Honors Awardee",
  "First Place in “COVID-19 Reporting” — CT SPJ contest",
  "Connecticut Broadcasters Association Scholarship",
];
const skills = [
  "News writing",
  "Communication",
  "Leadership",
  "Research",
  "Storytelling",
  "Ethics & integrity",
  "Organization",
  "Time management",
  "Conflict resolution",
  "Story pitching",
  "Investigating",
];
const timeline = (items) =>
  items
    .map(
      (x) =>
        `<div class="timeline-item"><span class="eyebrow">${esc(x.date)}</span><div><h3>${esc(x.title)}</h3><p class="institution">${esc(x.org)}</p><ul>${x.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div></div>`,
    )
    .join("");
function home() {
  const selected = [
    find("reporter-reel"),
    find("copy-of-u-k-collaboration"),
    find("travel-blog"),
  ];
  const featured = ["elmer-s-place", "christopher-dukes", "women-s-center"].map(
    (s) => site.articles.find((a) => a.path.includes(s)),
  );
  return shell(
    "Multimedia journalist",
    `<section class="hero"><div class="hero-copy">${label('<span class="status-dot"></span> MULTIMEDIA JOURNALIST & STORYTELLER')}<h1>Every story<br>deserves<br><em>to be heard.</em></h1><p>I’m Samantha. A curious mind, a thoughtful listener,<br class="desktop-only"> and a journalist bringing human stories into focus.</p><div class="hero-actions">${button("/work/", "Discover my work")}<a class="play-link" href="/reporter-reel/"><span class="play-icon" aria-hidden="true">▷</span> Watch my reel</a></div><div class="hero-location"><span class="small-star" aria-hidden="true">✺</span> Curiosity-led reporting. A human perspective.</div></div><div class="hero-visual"><div class="portrait-frame">${image(site.portrait, "Samantha Bender, multimedia journalist", "hero-portrait", true)}<span class="portrait-caption">A HUMAN PERSPECTIVE.</span></div><span class="hero-star" aria-hidden="true">✺</span><div class="hero-note">Curiosity is where<br>every good story begins.<span aria-hidden="true">↗</span></div><span class="vertical-note">REPORTING · WRITING · CONNECTING</span></div></section><div class="discipline-strip"><span>Many mediums. One purpose.</span><p>Broadcast <i>✺</i> Digital storytelling <i>✺</i> Writing <i>✺</i> Documentary</p></div><section class="section selected-work" id="selected-work">${sectionHead("01 / SELECTED WORK", "A lens on <em>the world.</em>", "/work/")}<div class="project-grid">${selected.map(projectCard).join("")}</div></section><section class="about-preview"><div class="about-index">02 / THE PERSON<br>BEHIND THE STORIES<span aria-hidden="true">✺</span></div><div><h2>Good journalism starts<br>with <em>genuine curiosity.</em></h2><p>I believe everyone has a unique story to tell. My goal is to give others a voice through reporting that listens closely, asks better questions, and puts people first.</p><a class="text-link" href="/about/">A little more about me ${arrow}</a></div><div class="about-side">A nose for the truth.<br>A heart for the story.<span>SB.</span></div></section><section class="section latest-stories">${sectionHead("03 / IN WRITING", "Beyond <em>the headline.</em>", "/articles/", "View all articles")}<div class="article-grid">${featured.map(articleCard).join("")}</div></section>`,
  );
}
function work() {
  return shell(
    "Selected work",
    `<section class="page-heading">${label("THE PORTFOLIO / SAMANTHA BENDER")}<h1>Different mediums.<br><em>Same curiosity.</em></h1><div class="heading-bottom"><p>Reporting, writing, and creating—with people at the center.<br>Explore the stories and projects that shape my work.</p><span class="outline-star" aria-hidden="true">✺</span></div></section><section class="section work-collection"><div class="filter-bar" data-filter-group="projects" role="group" aria-label="Filter projects"><button class="active" data-filter="all" aria-pressed="true">All work <sup>${projects.length}</sup></button><button data-filter="broadcast" aria-pressed="false">Broadcast</button><button data-filter="film" aria-pressed="false">Documentary</button><button data-filter="digital" aria-pressed="false">Digital & print</button></div><div class="project-grid" id="projects">${projects.map(projectCard).join("")}</div><div class="work-writing"><h2>There’s more <em>on the page.</em></h2><p>Explore ${site.articles.length} stories from The Recorder.</p>${button("/articles/", "Explore the articles", "outline")}</div></section>`,
    "work",
  );
}
function about() {
  return shell(
    "About",
    `<section class="page-heading">${label("THE PERSON BEHIND THE STORIES")}<h1>A curious mind.<br><em>A human perspective.</em></h1></section><section class="about-full section"><div class="about-photo">${image(site.portrait, "Samantha Bender")}<span class="photo-label">SAMANTHA BENDER / MULTIMEDIA JOURNALIST</span></div><div class="bio">${label("HELLO, I’M SAMANTHA")}<h2>Listening first.<br><em>Always.</em></h2>${biography.map((p) => `<p>${esc(p)}</p>`).join("")}${button("/contact/", "Let’s connect", "outline")}</div></section><section class="quote-section"><span aria-hidden="true">“</span><blockquote>Everyone has a unique story to tell.<br>My goal is to help give others a voice.</blockquote><p>THE WHY BEHIND MY WORK</p></section><section class="section" id="experience">${sectionHead("THE JOURNEY", "Experience <em>that shapes me.</em>", "/resume/", "View résumé")}<div class="timeline">${timeline(experience)}</div></section><section class="section education-section" id="education">${sectionHead("LEARNING & GROWING", "A foundation <em>in curiosity.</em>")}<div class="timeline">${timeline(education)}</div><details class="archive-history"><summary>Earlier experience & education from the original home page</summary>${timeline(archivedExperience)}${timeline(archivedEducation)}</details><p class="archive-note">¹ Dates and “Current” labels are preserved from the original portfolio; they describe the source résumé rather than a verified present-day role.</p></section>`,
    "about",
  );
}
function resume() {
  return shell(
    "Résumé",
    `<section class="page-heading">${label("EXPERIENCE / EDUCATION / SKILLS")}<h1>Always learning.<br><em>Always looking closer.</em></h1><div class="heading-bottom"><p>A background in reporting, newsroom leadership,<br>digital storytelling, and working with people.</p><button class="button outline" data-print>Print résumé <span aria-hidden="true">↗</span></button></div></section><section class="section resume-layout"><aside><h2>Samantha<br><em>Bender.</em></h2><p>Multimedia Journalist</p><a href="mailto:samanthabendertv@gmail.com">samanthabendertv@gmail.com</a><a href="tel:+18606047489">860-604-7489</a><div class="resume-skills">${label("FOCUS")}<p>${skills.map(esc).join("<br>")}</p></div><a class="text-link" href="${site.resume}" target="_blank" rel="noopener">View original résumé ${arrow}</a><a href="https://www.wkbn.com/author/samantha-bender/" target="_blank" rel="noopener">WKBN author page ↗</a></aside><div><h2>Work <em>experience.</em></h2>${timeline(experience)}<h2 class="resume-education">Education.</h2>${timeline(education)}<h2 class="resume-education">Recognition.</h2><ul class="awards-list">${awards.map((a) => `<li>${esc(a)}</li>`).join("")}</ul><h2 class="resume-education">Notable coverage.</h2><p>East Palestine Train Derailment</p><p class="archive-note">¹ Source-era dates retained from the original portfolio. See the original résumé image for the source document.</p></div></section><details class="original-resume section"><summary>View the original résumé document <span aria-hidden="true">+</span></summary>${image(site.resume, "Original résumé document from Samantha Bender’s portfolio")}</details>`,
    "resume",
  );
}
function articles() {
  const sorted = [...site.articles].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  return shell(
    "Articles",
    `<section class="page-heading">${label("THE RECORDER / STORIES & PERSPECTIVES")}<h1>Words that<br><em>make a connection.</em></h1><div class="heading-bottom"><p>Campus, community, culture, and the conversations<br>that matter. A collection of my published writing.</p><span class="collection-count">${site.articles.length}<small>STORIES TO EXPLORE</small></span></div></section><section class="section article-collection"><div class="article-toolbar"><div class="filter-bar" data-filter-group="articles" role="group" aria-label="Filter articles"><button class="active" data-filter="all" aria-pressed="true">All stories</button><button data-filter="reporting" aria-pressed="false">Reporting</button><button data-filter="opinion" aria-pressed="false">Opinion</button></div><label class="search-field"><span class="sr-only">Search articles</span><input type="search" id="article-search" placeholder="Find a story…"><span aria-hidden="true">⌕</span></label></div><p class="results-count" aria-live="polite">${site.articles.length} stories</p><div class="article-grid" id="articles">${sorted.map(articleCard).join("")}</div><div class="empty-state" hidden><h2>No stories found.</h2><p>Try another search or explore all stories.</p><button class="button outline" data-reset-search>Clear filters ↗</button></div></section>`,
    "articles",
  );
}
function article(a) {
  const related = site.articles
    .filter((x) => x.path !== a.path && x.category === a.category)
    .slice(0, 3);
  return shell(
    a.title,
    `<article class="story"><header class="story-header"><a class="text-link back-link" href="/articles/">← All articles</a>${label(a.category + " / THE RECORDER")}<h1>${esc(a.title)}</h1><div class="story-byline"><span>By Samantha Bender</span><time>${esc(a.date)}</time><span>${Math.max(1, Math.ceil(a.paragraphs.join(" ").split(/\s+/).length / 220))} min read</span></div></header>${a.image ? `<figure class="story-cover">${image(a.image, a.title, "", true)}</figure>` : ""}<div class="story-body">${a.body}${a.images
      .filter((src) => src !== a.image)
      .map(
        (src) =>
          `<figure class="inline-article-image">${image(src, "Image accompanying " + a.title)}</figure>`,
      )
      .join(
        "",
      )}<div class="story-end"><span>SB.</span><button class="text-link" data-share>Copy story link ↗</button><span class="share-status" role="status"></span></div></div></article><section class="section related-stories">${sectionHead("KEEP READING", "Another <em>perspective.</em>", "/articles/", "All stories")}<div class="article-grid">${related.map(articleCard).join("")}</div></section>`,
    "articles",
    a.excerpt,
  );
}
function media(p) {
  if (p.mediaUnavailable)
    return `<div class="archived-video"><div class="archive-poster">${p.image ? image(p.image, p.title) : projectArtwork(p)}</div><div class="archive-media-message">${label("FROM THE BROADCAST ARCHIVE")}<h2>The story, on screen.</h2><p>This archived video is currently unavailable from its original Wix host. The original page and video link are preserved below.</p>${button("https://samanthabender21.wixsite.com/sbender/" + p.path, "View original page", "outline")}</div></div><p class="media-fallback"><a href="${p.video}" target="_blank" rel="noopener">Original video source ↗</a></p>`;
  if (p.video.includes("youtube")) {
    const id = p.video.split("v=")[1];
    return `<div class="video-stage" data-youtube="${esc(id)}" data-video-title="${esc(p.title)}">${pimage(p) ? image(pimage(p), p.title) : projectArtwork(p)}<button class="video-play" aria-label="Watch the ${p.path === "reporter-reel" ? "reel" : "film"}: ${esc(p.title)}"><span aria-hidden="true">▷</span><small>WATCH THE ${p.path === "reporter-reel" ? "REEL" : "FILM"}</small></button></div><p class="media-fallback">Video hosted on YouTube. <a href="${esc(p.video)}" target="_blank" rel="noopener">Watch on YouTube ↗</a></p>`;
  }
  if (p.video)
    return `<div class="video-stage native"><video controls playsinline preload="metadata" poster="${pimage(p)}" aria-label="${esc(p.title)}"><source src="${p.video}" type="video/mp4">Your browser does not support this video.</video></div><p class="media-fallback"><a href="${p.video}" target="_blank" rel="noopener">Open original video ↗</a></p>`;
  if (p.category === "Podcast")
    return `<div class="podcast-player"><span class="podcast-art" aria-hidden="true">In<br><em>Context.</em><small>THE PODCAST</small></span><div>${label("CCSU JOURNALISM / EPISODE 8")}<h2>The Bachelor Nation<br><em>controversy.</em></h2><p>A conversation about television, race, and the stories shaping our culture.</p>${button(p.links[0], "Listen on SoundCloud", "outline")}</div></div><iframe class="soundcloud-embed" title="In Context podcast — Episode 8" loading="lazy" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(p.links[0])}&color=%237f343b&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false"></iframe>`;
  return `<div class="editorial-project">${p.category === "Magazine" ? `<a class="magazine-preview" href="/assets/how-we-live-now.pdf" aria-label="Read How We Live Now magazine">${image(p.image, "How We Live Now — original magazine cover")}</a>` : `<div class="editorial-cover ${p.category === "Travel blog" ? "travel-cover" : ""}">${p.category === "Travel blog" ? image(p.image, "Connecticut Travel Diaries — skydiving adventure") : ""}${label(p.category === "Travel blog" ? "CONNECTICUT / CLOSE TO HOME" : "CCSU DEPARTMENT OF JOURNALISM")}<h2>${p.category === "Travel blog" ? "A little closer.<br><em>A world away.</em>" : p.category === "Magazine" ? "How we<br><em>live now.</em>" : "Across borders.<br><em>Shared stories.</em>"}</h2><span class="cover-star" aria-hidden="true">✺</span><p>${p.category === "Travel blog" ? "CT TRAVEL DIARIES" : "THE PANDEMIC REPORT"}</p></div>`}<div><span class="eyebrow">${p.category === "Travel blog" ? "EXPLORE CONNECTICUT" : "A COLLABORATIVE PERSPECTIVE"}</span><h3>${esc(p.title)}</h3><p>${p.category === "Travel blog" ? "Safe, affordable adventures and a new way of looking at the places close to home." : "A journalism project exploring the impact of the pandemic on the people and communities around us."}</p>${p.links[0] ? button(p.links[0], p.category === "Travel blog" ? "Visit the travel blog" : p.category === "Magazine" ? "Read the magazine (PDF)" : "Explore the original project", "outline") : ""}</div></div>`;
}
function project(p) {
  const isNews = p.category === "News package";
  return shell(
    p.title,
    `<section class="page-heading project-heading"><a class="text-link back-link" href="${isNews ? "/news-packages/" : "/work/"}">← ${isNews ? "News packages" : "Selected work"}</a>${label(p.category + " / SAMANTHA BENDER")}<h1>${esc(p.title).replace(": ", "<br><em>")}${p.title.includes(": ") ? "</em>" : ""}<span class="title-period">.</span></h1>${p.path === "reporter-reel" ? '<p class="project-deck">On the scene. Asking questions. Bringing the story home.<br>A selection of my work in broadcast journalism.</p>' : ""}</section><section class="section project-content">${media(p)}<div class="project-details"><aside>${label("THE PROJECT")}<p>${esc(p.category)}</p>${label("BY")}<p>Samantha Bender</p>${p.category === "Documentary" ? label("RELEASED") + "<p>2021</p>" : ""}</aside><div><h2>${p.category === "Podcast" ? "In conversation." : p.category === "Documentary" ? "Behind the documentary." : p.category === "News package" ? "The story, on screen." : "A closer look."}</h2>${p.paragraphs.length ? p.paragraphs.map((t) => `<p>${esc(t)}</p>`).join("") : `<p>${p.path === "reporter-reel" ? "Reporting and producing for CCSU News, with a focus on people, community, and the stories that connect us." : `A news package from Samantha Bender’s broadcast portfolio: ${esc(p.title)}.`}</p>`}${
      p.links.length > 1
        ? `<div class="project-links">${p.links
            .slice(1)
            .map(
              (l) =>
                `<a class="text-link" href="${esc(l)}" target="_blank" rel="noopener">${l.includes("instagram") ? "Instagram" : l.includes("facebook") ? "Facebook" : l.includes("twitter") ? "Twitter" : "Explore project"} ${arrow}</a>`,
            )
            .join("")}</div>`
        : ""
    }</div></div></section>${
      p.path === "news-package"
        ? `<section class="section news-index">${sectionHead("THE REPORTING", "From campus <em>to community.</em>")}<div class="project-grid">${projects
            .filter((x) => x.category === "News package")
            .map(projectCard)
            .join("")}</div></section>`
        : `<section class="section next-project">${label("KEEP EXPLORING")}<a href="${route(projects[(projects.indexOf(p) + 1) % projects.length].path)}"><h2>${esc(projects[(projects.indexOf(p) + 1) % projects.length].title)}</h2>${arrow}</a></section>`
    }`,
    "work",
    p.paragraphs.join(" ") || p.title,
  );
}
function contact() {
  return shell(
    "Contact",
    `<section class="page-heading">${label("SAY HELLO / START A CONVERSATION")}<h1>Great stories<br>start with <em>a hello.</em></h1></section><section class="section contact-layout"><div class="contact-info"><h2>Have a story in mind?</h2><p>For opportunities, collaborations, or a story worth telling, I’d love to hear from you.</p><div>${label("EMAIL")}<a href="mailto:samanthabendertv@gmail.com">samanthabendertv@gmail.com ${arrow}</a>${label("PHONE")}<a href="tel:+18606047489">860-604-7489 ${arrow}</a></div><p class="legacy-contact">Earlier portfolio contact: <a href="mailto:Samanthabender@my.ccsu.edu">Samanthabender@my.ccsu.edu</a></p><div class="contact-socials">${socials}</div><span class="contact-star" aria-hidden="true">✺</span></div><form id="contact-form"><div class="form-row"><label>Your name <span>(required)</span><input name="name" autocomplete="name" required maxlength="120"></label><label>Email address <span>(required)</span><input name="email" type="email" autocomplete="email" required maxlength="254"></label></div><label>What’s on your mind?<input name="subject" required maxlength="200" placeholder="A story, an opportunity, a question…"></label><label>Your message <textarea name="message" rows="5" required maxlength="5000" placeholder="Tell me a little about it."></textarea></label><p class="form-note">This opens a draft in your email app for you to review and send.</p><button class="button" type="submit">Write to Samantha ${arrow}</button><p id="form-status" role="status"></p></form></section>`,
    "contact",
  );
}
const routes = new Map();
routes.set("/", home());
routes.set("/work/", work());
routes.set("/about/", about());
routes.set("/resume/", resume());
routes.set("/articles/", articles());
routes.set("/contact/", contact());
for (const p of projects) {
  routes.set(route(p.path), project(p));
  if (pretty[p.path]) routes.set("/" + p.path + "/", project(p));
}
for (const a of site.articles) routes.set("/" + a.path + "/", article(a));
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("public", "dist", { recursive: true });
await cp("src/style.css", "dist/style.css");
await cp("src/fonts.css", "dist/fonts.css");
await cp("src/app.js", "dist/app.js");
for (const [r, html] of routes) {
  const dest = path.join("dist", r);
  await mkdir(dest, { recursive: true });
  await writeFile(path.join(dest, "index.html"), html);
}
await writeFile(
  "dist/404.html",
  shell(
    "Page not found",
    `<section class="page-heading error-page">${label("404 / A DIFFERENT DIRECTION")}<h1>Let’s find<br><em>your next story.</em></h1><p>This page isn’t here. There’s plenty more to explore.</p>${button("/work/", "Explore the work")}</section>`,
  ),
);
await writeFile(
  "dist/routes.json",
  JSON.stringify([...routes.keys()], null, 2),
);
console.log(
  `Built ${routes.size} pages, including all 47 source pages and redesigned navigation pages.`,
);
