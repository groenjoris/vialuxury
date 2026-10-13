import { render } from "@react-email/render";
import { createElement } from "react";
import type { EmailMode } from "@/components/theme";
import type { EmailEntry } from "./registry";

export async function renderEmail(entry: EmailEntry, mode: EmailMode = "light"): Promise<string> {
  return render(
    createElement(entry.Component, { ...(entry.Component.PreviewProps ?? {}), mode }),
    { pretty: true },
  );
}
