// Exporteert alle e-mails uit de registry als statische HTML naar de hoofdapp:
//   public/emails/<slug>.html en <slug>.dark.html  (gehost onder /emails/…)
//   app/data/mht-emails.json                         (lijst voor /multi-hotel-trip/emails)
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
  mkdirSync(outDir, { recursive: true });
  const index: { slug: string; title: string; description: string; section: string; subject?: string; preheader?: string; variantOf?: string }[] = [];
  const crm: { slug: string; title: string; description: string; subject?: string; preheader?: string }[] = [];
  for (const e of emails) {
    if (e.section === "crm") {
      writeFileSync(resolve(outDir, `${e.slug}.html`), await renderEmail(e, "light"));
      crm.push({ slug: e.slug, title: e.title, description: e.description, subject: e.subject, preheader: e.preheader });
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
  console.log(`${index.length} e-mails → ${outDir}`);
}
main().catch((err) => { console.error(err); process.exit(1); });
