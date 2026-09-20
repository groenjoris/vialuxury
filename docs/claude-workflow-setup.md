# Claude → GitHub → Vercel workflow (design prototyping)

How Kuichaya works with Claude to iterate on this prototype, and how changes reach Joris and the live preview.

## The loop

1. **Describe the change to Claude** (in the Claude chat/app) — a design requirement, a screenshot of inspiration, tokens, copy, etc.
2. **Claude edits the code** directly in a local, git-connected copy of this repo, on its own branch (never on `main`).
3. **Claude commits and pushes** that branch to GitHub, and **opens a Pull Request** against `main`.
4. **Vercel automatically deploys a Preview** for that Pull Request and posts the live preview link as a comment directly on the PR — no Vercel login needed to view it.
5. **Joris reviews** the PR (code diff + the live preview link) and merges it into `main` when it's ready.
6. Merging to `main` triggers Vercel's **Production** deployment — the change goes live on the main prototype URL.

Nothing reaches `main` (and therefore production) without Joris merging the PR.

## Where things live

- Working copy: this repo, cloned locally (git-connected, not a zip export) so branching/commits/pushes all work normally.
- Local dev preview (optional, before even opening a PR): `npm install` once, then `npm run dev` → `http://localhost:3000`. The prototype is behind a simple password page — password: `dealfirst`.
- Prototype namespaces (Release 1, Release 2, Multi Hotel Trip, etc.) follow the conventions already documented in `CLAUDE.md` at the repo root — Claude reads that file before making changes so new work stays in the right namespace and doesn't cross-contaminate other prototypes.

## Reviewing a Pull Request (for Joris, or anyone)

- Open the PR on GitHub → **Files changed** tab for the code diff.
- Scroll the PR conversation for the Vercel bot comment → click the preview link to click through the actual change live.
- **Merge** when happy; **request changes** or comment inline otherwise.

## Notes

- GitHub access for pushing is authenticated via a personal access token, generated once by Kuichaya and configured locally — it only grants access to repos she already has permission on, and can be revoked any time from GitHub → Settings → Developer settings → Personal access tokens.
- Vercel preview deployments are already part of the project's free plan; no paid seats or upgrades are needed for this workflow.
