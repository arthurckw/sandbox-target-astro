# sandbox-target-astro

**PBI-044 v0 sandbox** — target repo for AI-agent-driven changes.

This repo is deliberately small (3 pages of the summit report) and represents the "new practice" template for HumanJudge infra:

- **Frontend hosting:** Firebase Hosting (free tier, PR preview channels) — NOT Netlify
- **Agent workflow:** Claude Code on the Web at claude.ai/code (no roll-your-own orchestrator)

## Local dev

```bash
npm install
npm run dev    # http://localhost:4321
npm run build  # → dist/
```

## Firebase Hosting setup (one-time per repo)

1. Install CLI: `npm i -g firebase-tools`
2. Log in: `firebase login`
3. Create a Firebase project (or reuse an existing one):
   `firebase projects:create humanjudge-sandbox-astro`
4. Update `.firebaserc` — replace `REPLACE_WITH_FIREBASE_PROJECT_ID` with the created project ID
5. Update `.github/workflows/firebase-hosting-*.yml` — same replacement (2 files)
6. Wire GitHub Actions to Firebase (creates the service account + adds it as a GitHub secret automatically):
   `firebase init hosting:github`
   - Answer "yes" to setting up auto-deploy on merge to main
   - Answer "yes" to setting up preview deploys on PRs
7. Commit and push. First PR → auto preview URL from Firebase.

## PR preview flow

- Open a PR → GitHub Actions workflow builds `npm run build` → deploys to a Firebase preview channel
- Preview URL posted as a PR comment: `https://<project>--pr-<N>-<hash>.web.app`
- Merge to main → production deploy (Firebase "live" channel)

## Agent workflow (via claude.ai/code)

- Team members with a Claude Pro/Max plan log in at claude.ai/code
- Connect this repo (`arthurckw/sandbox-target-astro`) via the Claude GitHub App (installed on the `humanjudge` org)
- Chat a request → Claude opens a PR → Firebase preview URL auto-generates → review → merge

`.claude/agents/` contains the Planner/Coder/QA role prompts from PBI-044; Claude Code Web will use them as custom subagents when working on this repo.
