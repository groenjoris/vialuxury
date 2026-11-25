// Exporteert alle e-mails uit de registry als statische HTML naar de hoofdapp:
//   public/emails/<slug>.html en <slug>.dark.html  (gehost onder /emails/…)
//   app/data/mht-emails.json                         (lijst voor /multi-hotel-trip/emails)
//   app/data/crm-emails.json, commercieel-emails.json (lijsten voor /crm en /commercieel)
// Draaien: `npm run export` in email-designs/ (na elke wijziging aan een e-mail).
// Met EMAIL_BASE_URL=https://vialuxury.vercel.app krijgen afbeeldingen absolute URL's.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { emails } from "../lib/registry";
import { renderEmail } from "../lib/renderEmail";

async function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(here, "../../public/emails");
  const dataFile = resolve(here, "../../app/data/mht-emails.json");
  // CRM-concepten: alleen light, eigen lijst voor /crm/<slug>.
  const crmFile = resolve(here, "../../app/data/crm-emails.json");
  // Automationmails: light + een donkere versie voor de preview, eigen lijst voor /automation/<slug>.
  const automationFile = resolve(here, "../../app/data/automation-emails.json");
  // Commerciële mails (nieuwsbrieven en acties): alleen light, eigen lijst voor /commercieel/<slug>.
  const commercieelFile = resolve(here, "../../app/data/commercieel-emails.json");
  const commercieel: { slug: string; title: string; description: string; subject?: string; preheader?: string; variantOf?: string; variantLabel?: string }[] = [];
  mkdirSync(outDir, { recursive: true });
  const index: { slug: string; title: string; description: string; section: string; subject?: string; preheader?: string; variantOf?: string }[] = [];
  const crm: { slug: string; title: string; description: string; subject?: string; preheader?: string; variantOf?: string; variantLabel?: string }[] = [];
  const automation: typeof crm = [];
  for (const e of emails) {
    if (e.section === "crm" || e.section === "automation") {
      const list = e.section === "crm" ? crm : automation;
      writeFileSync(resolve(outDir, `${e.slug}.html`), await renderEmail(e, "light"));
      // De automationmails hebben ook een donkere versie. Die is alleen voor de preview: de mail
      // die verstuurd wordt is de lichte, die zichzelf omzet met de mediaquery.
      if (e.section === "automation") writeFileSync(resolve(outDir, `${e.slug}.dark.html`), await renderEmail(e, "dark"));
      list.push({ slug: e.slug, title: e.title, description: e.description, subject: e.subject, preheader: e.preheader, variantOf: e.variantOf, variantLabel: e.variantLabel });
      console.log("✓", e.slug);
      continue;
    }
    if (e.section === "commercieel") {
      writeFileSync(resolve(outDir, `${e.slug}.html`), await renderEmail(e, "light"));
      commercieel.push({ slug: e.slug, title: e.title, description: e.description, subject: e.subject, preheader: e.preheader, variantOf: e.variantOf, variantLabel: e.variantLabel });
      console.log("✓", e.slug);
      continue;
    }
    writeFileSync(resolve(outDir, `${e.slug}.html`), await renderEmail(e, "light"));
    writeFileSync(resolve(outDir, `${e.slug}.dark.html`), await renderEmail(e, "dark"));
    index.push({ slug: e.slug, title: e.title, description: e.description, section: e.section, subject: e.subject, preheader: e.preheader, variantOf: e.variantOf });
    console.log("✓", e.slug);
  }
  writeFileSync(dataFile, JSON.stringify(index, null, 2) + "\n");
  writeFileSync(crmFile, JSON.stringify(crm, null, 2) + "\n");
  writeFileSync(automationFile, JSON.stringify(automation, null, 2) + "\n");
  writeFileSync(commercieelFile, JSON.stringify(commercieel, null, 2) + "\n");
  console.log(`${index.length} e-mails → ${outDir}`);
}
main().catch((err) => { console.error(err); process.exit(1); });
