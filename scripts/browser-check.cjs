const path = require("path");
const tooling = process.env.BROWSER_TOOLS_ROOT;
const { chromium } = require(
  tooling ? path.join(tooling, "playwright") : "playwright",
);
const { AxeBuilder } = require(
  tooling ? path.join(tooling, "@axe-core/playwright") : "@axe-core/playwright",
);
const fs = require("fs");
const assert = require("assert/strict");
const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";
if (!["127.0.0.1", "localhost"].includes(new URL(baseURL).hostname))
  throw Error("Browser audit must target a local server.");
fs.mkdirSync("browser-artifacts", { recursive: true });
(async () => {
  let browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  let context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  let page = await context.newPage();
  let errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/*", (r) => {
    let u = new URL(r.request().url());
    if (!["127.0.0.1", "localhost"].includes(u.hostname)) return r.abort();
    return r.continue();
  });
  let routes = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "dist/routes.json")),
  );
  let checks = [];
  for (let route of routes) {
    const response = await page.goto(baseURL + route);
    assert.equal(response.status(), 200, route);
    assert.equal(await page.locator("h1").count(), 1, route);
    assert.equal(await page.locator("main").count(), 1, route);
    const images = await page.locator("img").evaluateAll((es) => {
      es.forEach((i) => (i.loading = "eager"));
      return es.length;
    });
    if (images) {
      await page.waitForFunction(() =>
        [...document.images].every((i) => i.complete),
      );
      const broken = await page
        .locator("img")
        .evaluateAll((es) =>
          es.filter((i) => !i.naturalWidth).map((i) => i.src),
        );
      assert.deepEqual(broken, [], route);
    }
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "desktop overflow " + route,
    );
  }
  checks.push(
    `${routes.length} routes: HTTP 200, one main heading, no broken local images or desktop overflow`,
  );
  await page.goto(baseURL + "/articles/");
  await page.locator("#article-search").fill("Elmer");
  assert.equal(await page.locator(".article-card:visible").count(), 1);
  await page.locator("#article-search").fill("zzzznoresults");
  assert.equal(await page.locator(".empty-state").isVisible(), true);
  await page.locator("[data-reset-search]").click();
  assert.equal(await page.locator(".article-card:visible").count(), 32);
  await page.locator('[data-filter="opinion"]').click();
  assert.ok((await page.locator(".article-card:visible").count()) > 0);
  assert.ok((await page.locator(".article-card:visible").count()) < 32);
  checks.push("article search, empty state, reset, and opinion filter pass");
  await page.goto(baseURL + "/work/");
  await page.locator('[data-filter="film"]').click();
  assert.equal(await page.locator(".project-card:visible").count(), 1);
  await page.locator('[data-filter="all"]').click();
  assert.equal(await page.locator(".project-card:visible").count(), 12);
  checks.push("project filters pass");
  await page.goto(baseURL + "/reporter-reel/");
  await page.locator(".video-play").click();
  assert.match(
    await page.locator(".video-stage iframe").getAttribute("src"),
    /p1HJC6aWqRY/,
  );
  checks.push(
    "reel play button loads original privacy-enhanced YouTube embed; remote playback not tested",
  );
  await page.goto(baseURL + "/contact/");
  await page.locator('[name="name"]').fill("Portfolio Visitor");
  await page.locator('[name="email"]').fill("visitor@example.com");
  await page.locator('[name="subject"]').fill("Reporting opportunity");
  await page
    .locator('[name="message"]')
    .fill("A test draft for the portfolio.");
  let mailto = "";
  await page.evaluate(() => {
    window.open = () => null;
  });
  page.on("request", (r) => {
    if (r.url().startsWith("mailto:")) mailto = r.url();
  });
  await page.locator("form button").click();
  assert.match(
    await page.locator("#form-status").innerText(),
    /review and send/,
  );
  checks.push("contact form validates fields and explains email-app handoff");
  let audits = [];
  for (let route of [
    "/",
    "/about/",
    "/work/",
    "/resume/",
    "/articles/",
    "/contact/",
    "/documentary/",
    "/podcast/",
    "/magazine/",
    "/post/elmer-s-place-receives-aid-from-barstool-fund-and-gofundme-to-stay-afloat/",
  ]) {
    await page.goto(baseURL + route);
    let result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    audits.push({
      route,
      violations: result.violations.map((x) => ({
        id: x.id,
        impact: x.impact,
        nodes: x.nodes.map((n) => n.target),
      })),
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (let route of routes) {
    await page.goto(baseURL + route);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "mobile overflow " + route,
    );
  }
  await page.goto(baseURL + "/");
  await page.locator(".menu-toggle").click();
  assert.equal(await page.locator("#navigation").isVisible(), true);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#navigation").isVisible(), false);
  checks.push(
    "all routes fit 390px mobile viewport; menu opens and Escape closes it",
  );
  await page.screenshot({
    path: "browser-artifacts/home-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "browser-artifacts/home-desktop.png",
    fullPage: true,
  });
  await page.goto(baseURL + "/articles/");
  await page.screenshot({
    path: "browser-artifacts/articles-desktop.png",
    fullPage: true,
  });
  await page.goto(baseURL + "/magazine/");
  await page.screenshot({
    path: "browser-artifacts/magazine-desktop.png",
    fullPage: true,
  });
  fs.writeFileSync(
    "browser-artifacts/validation.json",
    JSON.stringify({ checks, audits, errors }, null, 2),
  );
  console.log(JSON.stringify({ checks, audits, errors }, null, 2));
  await browser.close();
  if (errors.length || audits.some((x) => x.violations.length))
    process.exitCode = 1;
})();
