import { render } from "@react-email/render";
import { createElement } from "react";
import type { EmailMode } from "../components/theme";
import type { EmailEntry } from "./registry";

export async function renderEmail(entry: EmailEntry, mode: EmailMode = "light"): Promise<string> {
  const html = await render(
    createElement(entry.Component, { ...(entry.props ?? entry.Component.PreviewProps ?? {}), mode }),
    { pretty: true },
  );
  return compact(html);
}

/**
 * De inspringing tussen de tags weghalen. `pretty: true` is prettig om te lezen, maar levert
 * in de grotere mails 15 tot 25 KB aan spaties op — en Gmail knipt een mail af boven ongeveer
 * 102 KB, waarbij juist de onderkant (met de knop) wegvalt. Alleen witruimte tússen tags gaat
 * weg; tekst binnen een tag blijft zoals hij is, en <pre> laten we met rust.
 *
 * React zet tussen twee losse stukken tekst het scheidingsteken `<!-- -->`, bijvoorbeeld bij
 * `Vragen hierover?{" "}<Link>…</Link>`. Zat daar witruimte omheen, dan is die spatie bedoeld en
 * moet hij blijven staan; anders zou "Vragen hierover? Onze klantenservice helpt je graag."
 * aan elkaar plakken. Daarom eerst elk scheidingsteken met zijn witruimte vervangen door een
 * tijdelijk teken, dan pas de inspringing weghalen en het teken terugzetten als spatie.
 */
const SPACE = "\u0000";

function compact(html: string): string {
  if (/<pre[\s>]/i.test(html)) return html;
  return html
    .replace(/(\s*)<!-- -->(\s*)/g, (_m, before: string, after: string) => (before || after ? SPACE : ""))
    .replace(/>\s+</g, "><")
    .replace(/\n{2,}/g, "\n")
    .replaceAll(SPACE, " ");
}
