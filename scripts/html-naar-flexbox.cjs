// Zet de tabel-HTML van een mail om naar div's met flexbox, zodat een Figma-importer er
// autolayout-frames van maakt. Alleen voor Figma; de mail zelf blijft tabellen gebruiken.
//
// Gebruik (vanuit de projectmap, node-html-parser is nodig):
//   node scripts/html-naar-flexbox.js public/emails/<slug>.html public/figma/<slug>.html
//
// Na een wijziging aan de mails: eerst `npm run export` in email-designs/, daarna dit script
// opnieuw over public/emails/v01_*.html draaien.
const { parse } = require("node-html-parser");
const fs = require("node:fs");
const path = require("node:path");

const styleOf = (el) => el.getAttribute("style") || "";
const decl = (style) => Object.fromEntries(
  style.split(";").filter(Boolean).map((d) => {
    const i = d.indexOf(":");
    return [d.slice(0, i).trim(), d.slice(i + 1).trim()];
  }).filter(([k]) => k)
);
const toStyle = (o) => Object.entries(o).map(([k, v]) => `${k}:${v}`).join(";");

/** Celbreedte → flexregels, zodat de kolomverdeling in Figma klopt. */
function cellFlex(d) {
  const w = d.width;
  delete d.width;
  if (!w) return "1 1 auto";
  if (w === "1%") return "0 0 auto";          // krimpt mee met de inhoud (knop, blokje)
  if (w === "100%") return "1 1 auto";
  return `0 0 ${w}`;
}

/** vertical-align van een cel → align-self in de rij. */
function alignSelf(d) {
  const v = d["vertical-align"];
  delete d["vertical-align"];
  if (v === "middle") return "center";
  if (v === "bottom") return "flex-end";
  if (v === "top") return "flex-start";
  return "stretch";
}

/** Achtergrondfoto → echte <img>, die importeert Figma wel. */
function backgroundToImg(d) {
  const bg = d["background-image"];
  if (!bg) return null;
  const m = /url\((.*?)\)/.exec(bg);
  delete d["background-image"];
  delete d["background-size"];
  delete d["background-position"];
  if (!m) return null;
  return `<img src="${m[1].replace(/^['"]|['"]$/g, "")}" style="width:100%;height:100%;object-fit:cover;display:block" />`;
}

function convert(node) {
  if (node.nodeType === 3) return node.rawText;
  if (node.nodeType !== 1) return "";
  const tag = node.rawTagName?.toLowerCase();

  if (tag === "table") {
    const d = decl(styleOf(node));
    const rows = node.querySelectorAll("tr").filter((tr) => tr.closest("table") === node);
    const inner = rows.map((tr) => {
      const cells = tr.childNodes.filter((n) => n.rawTagName?.toLowerCase() === "td");
      if (cells.length <= 1) return cells.map(convertCell).join("");
      return `<div style="display:flex;flex-direction:row;align-items:stretch;width:100%">${cells.map((td) => convertCell(td, true)).join("")}</div>`;
    }).join("");
    const base = { display: "flex", "flex-direction": "column", ...d };
    if (!base.width && node.getAttribute("width") === "100%") base.width = "100%";
    // align="center" op een tabel met max-width = de kolom van de mail: in flexbox gecentreerd
    if (node.getAttribute("align") === "center" && base["max-width"]) {
      base["align-self"] = "center";
      base.width = "100%";
    }
    const img = backgroundToImg(base);
    return `<div style="${toStyle(base)}">${img ?? ""}${inner}</div>`;
  }

  if (tag === "tbody" || tag === "tr") return node.childNodes.map(convert).join("");

  const attrs = Object.entries(node.attributes)
    .filter(([k]) => !["border", "cellpadding", "cellspacing", "role", "align", "data-id"].includes(k))
    .map(([k, v]) => ` ${k}="${v.replace(/"/g, "&quot;")}"`).join("");
  const kids = node.childNodes.map(convert).join("");
  if (["img", "br", "hr", "meta", "link"].includes(tag)) return `<${tag}${attrs} />`;
  return `<${tag}${attrs}>${kids}</${tag}>`;
}

function convertCell(td, inRow = false) {
  const d = decl(styleOf(td));
  const flex = inRow ? cellFlex(d) : null;
  const self = inRow ? alignSelf(d) : (delete d["vertical-align"], null);
  const img = backgroundToImg(d);
  const base = { display: "flex", "flex-direction": "column", ...d };
  // align/text-align op een cel bepaalt in flexbox waar de inhoud staat
  const a = td.getAttribute("align") || d["text-align"];
  if (a === "right") base["align-items"] = "flex-end";
  else if (a === "center") base["align-items"] = "center";
  if (inRow) { base.flex = flex; base["align-self"] = self; base["min-width"] = "0"; }
  const kids = td.childNodes.map(convert).join("");
  return `<div style="${toStyle(base)}">${img ?? ""}${kids}</div>`;
}

const [src, dest] = process.argv.slice(2);
const html = fs.readFileSync(src, "utf8");
const root = parse(html, { blockTextElements: { script: true, style: true } });
root.querySelectorAll("[data-skip-in-text]").forEach((el) => el.remove());
const body = root.querySelector("body");
const out = body.childNodes.map(convert).join("");
const title = path.basename(src, ".html");
fs.writeFileSync(dest, `<!doctype html>
<html lang="nl"><head><meta charset="utf-8" /><title>${title}</title>
<style>
  body { margin: 0; background: #FFFFFF; font-family: 'Basis Grotesque Pro', Helvetica, Arial, sans-serif; }
  div { box-sizing: border-box; }
  p { margin: 0; }
  img { max-width: 100%; }
</style></head><body>${out}</body></html>
`);
