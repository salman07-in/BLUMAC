import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

test("Goal 1, 2, 4: robots.txt is present, has Content-Signal and Sitemap pointer", () => {
  const robotsPath = path.join(rootDir, "public", "robots.txt");
  assert.equal(fs.existsSync(robotsPath), true, "public/robots.txt must exist");

  const content = fs.readFileSync(robotsPath, "utf-8");
  assert.match(content, /User-agent:\s*\*/i, "robots.txt must declare User-agent: *");
  assert.match(content, /Content-Signal:\s*search=yes,\s*ai-train=no/i, "robots.txt must declare Content-Signal");
  assert.match(content, /Sitemap:\s*https:\/\/blumac\.in\/sitemap\.xml/i, "robots.txt must declare Sitemap: https://blumac.in/sitemap.xml");
});

test("Goal 3: sitemap generator exists and covers core routes", () => {
  const sitemapPath = path.join(rootDir, "src", "app", "sitemap.ts");
  assert.equal(fs.existsSync(sitemapPath), true, "src/app/sitemap.ts must exist");

  const content = fs.readFileSync(sitemapPath, "utf-8");
  assert.match(content, /\/shop/, "sitemap must include /shop");
  assert.match(content, /\/category\//, "sitemap must include categories");
  assert.match(content, /\/product\//, "sitemap must include products");
  assert.match(content, /\/policies\//, "sitemap must include policies");
});

test("Goal 5: Canonical link declared in root layout metadata", () => {
  const layoutPath = path.join(rootDir, "src", "app", "layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf-8");
  assert.match(content, /canonical:\s*["']\/["']/, "layout metadata must declare canonical");
});

test("Goal 6, 7, 8, 9, 10: JSON-LD Structured Data with Organization, sameAs, Offer in INR", () => {
  const compPath = path.join(rootDir, "src", "components", "common", "StructuredData.tsx");
  assert.equal(fs.existsSync(compPath), true, "StructuredData component must exist");

  const content = fs.readFileSync(compPath, "utf-8");
  assert.match(content, /@context.*schema\.org/, "must use schema.org");
  assert.match(content, /"Organization"/, "must include Organization schema");
  assert.match(content, /"Store"/, "must include Store schema");
  assert.match(content, /"sameAs"/, "must include sameAs external profiles");
  assert.match(content, /"WebSite"/, "must include WebSite schema with SearchAction");
  assert.match(content, /"Offer"/, "must include Offer schema");
  assert.match(content, /"priceCurrency":\s*"INR"/, "must declare priceCurrency in INR");
  assert.match(content, /"price":\s*p\.price/, "must declare offer price");
  assert.match(content, /"availability":/, "must declare stock availability");
});

test("Goal 11: llms.txt is served and contains site summary and key pages", () => {
  const llmsPath = path.join(rootDir, "public", "llms.txt");
  assert.equal(fs.existsSync(llmsPath), true, "public/llms.txt must exist");

  const content = fs.readFileSync(llmsPath, "utf-8");
  assert.match(content, /# BLUMAC Korean Store/i, "llms.txt must have title");
  assert.match(content, /https:\/\/blumac\.in\/shop/, "llms.txt must link /shop");
  assert.match(content, /https:\/\/blumac\.in\/category\//, "llms.txt must link categories");
  assert.match(content, /COSRX Advanced Snail 96/i, "llms.txt must list bestsellers and prices");
});

test("Goal 12: Middleware intercepts Accept: text/markdown and returns markdown representation", () => {
  const middlewarePath = path.join(rootDir, "src", "middleware.ts");
  const content = fs.readFileSync(middlewarePath, "utf-8");
  assert.match(content, /text\/markdown/, "middleware must check for text/markdown header");
  assert.match(content, /HOMEPAGE_MARKDOWN/, "middleware must return markdown representation");
  assert.match(content, /Content-Signal/, "middleware must set Content-Signal header");
});

test("Goal 13: WebMCP tools registered for in-browser agents and HTML annotated", () => {
  const webMcpPath = path.join(rootDir, "src", "components", "common", "WebMcpProvider.tsx");
  assert.equal(fs.existsSync(webMcpPath), true, "WebMcpProvider.tsx must exist");

  const content = fs.readFileSync(webMcpPath, "utf-8");
  assert.match(content, /modelContext\.registerTool/, "must register tools on navigator.modelContext");
  assert.match(content, /search_products/, "must register search_products tool");

  const headerPath = path.join(rootDir, "src", "components", "layout", "Header.tsx");
  const headerContent = fs.readFileSync(headerPath, "utf-8");
  assert.match(headerContent, /toolname/, "form must be annotated with toolname");
  assert.match(headerContent, /tooldescription/, "form must be annotated with tooldescription");
});

test("Goal 14: MCP Server Card (SEP-1649) published at /.well-known/mcp/server-card.json", () => {
  const cardPath = path.join(rootDir, "public", ".well-known", "mcp", "server-card.json");
  assert.equal(fs.existsSync(cardPath), true, "server-card.json must exist in public directory");

  const raw = fs.readFileSync(cardPath, "utf-8");
  const json = JSON.parse(raw);
  assert.equal(json.name, "blumac-korean-store");
  assert.equal(typeof json.version, "string");
  assert.equal(typeof json.endpoint, "string");
  assert.equal(json.capabilities.tools, true);
  assert.ok(Array.isArray(json.tools) && json.tools.length > 0, "must declare tools array");
});
