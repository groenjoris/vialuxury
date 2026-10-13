"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  title: string;
  slug: string;
  htmlLight: string;
  htmlDark: string;
};

export default function PreviewShell({ title, slug, htmlLight, htmlDark }: Props) {
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop");
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState(false);

  const html = mode === "dark" ? htmlDark : htmlLight;

  async function copyHtml() {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="toolbar">
        <Link href="/" className="btn">
          ← Alle designs
        </Link>
        <h1 style={{ fontSize: 22, margin: "0 8px", color: "var(--teal-dark)" }}>{title}</h1>
        <div className="spacer" />
        <div className="btn-group">
          <button
            className={`btn ${mode === "light" ? "active" : ""}`}
            onClick={() => setMode("light")}
          >
            ☀️ Licht
          </button>
          <button
            className={`btn ${mode === "dark" ? "active" : ""}`}
            onClick={() => setMode("dark")}
          >
            🌙 Donker
          </button>
        </div>
        <div className="btn-group">
          <button
            className={`btn ${width === "desktop" ? "active" : ""}`}
            onClick={() => setWidth("desktop")}
          >
            Desktop
          </button>
          <button
            className={`btn ${width === "mobile" ? "active" : ""}`}
            onClick={() => setWidth("mobile")}
          >
            Mobiel
          </button>
        </div>
        <button className="btn primary" onClick={copyHtml}>
          {copied ? "Gekopieerd ✓" : "Kopieer HTML"}
        </button>
        <a className="btn" href={`/api/emails/${slug}?mode=${mode}&download=1`}>
          Download .html
        </a>
      </div>
      <div className="preview-stage">
        <iframe
          srcDoc={html}
          title={title}
          style={{ width: width === "mobile" ? 375 : 700 }}
        />
      </div>
    </>
  );
}
