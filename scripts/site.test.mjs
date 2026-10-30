import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const site = JSON.parse(await readFile("content/site.json", "utf8"));
const inventory = JSON.parse(
  await readFile("content/source-inventory.json", "utf8"),
);
const routes = JSON.parse(await readFile("dist/routes.json", "utf8"));
const load = (route) =>
  readFile(path.join("dist", route, "index.html"), "utf8");
test("all 47 audited source pages exist, including all 32 complete article pages", async () => {
  assert.equal(inventory.length, 47);
  assert.equal(site.articles.length, 32);
  for (const source of inventory) {
    const r = source.path === "home" ? "/" : "/" + source.path + "/";
    assert.ok(routes.includes(r), "Missing source route " + r);
    const html = await load(r);
    assert.match(html, /<main id="main">/);
    assert.match(html, /<h1[ >]/);
  }
  for (const article of site.articles) {
    const html = await load("/" + article.path + "/");
    assert.ok(article.body.length > 0, article.path + " has no body");
    assert.ok(
      html.includes(article.body),
      article.path + " lost its original content",
    );
  }
});
test("every local navigation, stylesheet, script, image, and PDF resolves", async () => {
  for (const r of routes) {
    const html = await load(r);
    for (const match of html.matchAll(/(?:href|src)="(\/[^"\s]*)"/g)) {
      const local = match[1].split(/[?#]/)[0];
      if (!local) continue;
      const dest = path.join("dist", decodeURIComponent(local));
      try {
        const info = await stat(dest);
        if (info.isDirectory())
          assert.ok((await stat(path.join(dest, "index.html"))).isFile());
        else assert.ok(info.isFile());
      } catch (error) {
        assert.fail(`${r} references missing ${local}: ${error.message}`);
      }
    }
  }
});
test("résumé, awards, original document, magazine, and contact are preserved", async () => {
  const resume = await load("/resume/");
  assert.match(resume, /WKBN News/);
  assert.match(resume, /East Palestine Train Derailment/);
  assert.match(resume, /COVID-19 Reporting/);
  assert.ok(resume.includes(site.resume));
  const about = await load("/about/");
  assert.match(about, /Disney College Program/);
  assert.match(about, /Bristol Eastern High School/);
  const magazine = await load("/magazine/");
  assert.match(magazine, /how-we-live-now.pdf/);
  const contact = await load("/contact/");
  assert.match(contact, /samanthabendertv@gmail.com/);
  assert.match(contact, /opens a draft in your email app/);
});
test("archived video failures are disclosed while source URLs remain accessible", async () => {
  for (const project of site.projects.filter((p) => p.mediaUnavailable)) {
    const html = await load("/" + project.path + "/");
    assert.ok(html.includes(project.video));
    assert.match(html, /currently unavailable from its original Wix host/);
  }
});
