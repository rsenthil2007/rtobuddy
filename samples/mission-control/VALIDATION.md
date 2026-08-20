# Mission Control — Validation Scorecard

Use this after reviewing all three screens side by side.

## How to open

1. Run `start.bat` or `python -m http.server 8080` from the `rto_v5` folder.
2. Open `http://localhost:8080/samples/mission-control/`
3. Compare:
   - **Current** → `../../index.html`
   - **Sample A** → `balanced.html`
   - **Sample B** → `bold.html`
4. Resize browser to **375px** width (phone) and optionally **768px** (tablet).

## Score each (1 = weak, 5 = excellent)

| Criterion | Current | Balanced | Bold |
|-----------|---------|----------|------|
| First-10-second appeal | | | |
| Trust / credibility for LLR prep | | | |
| Readability on mobile | | | |
| Distinctiveness vs typical quiz apps | | | |
| Motivation to return daily | | | |
| Fit for Indian learners + parents | | | |
| **Total** | /30 | /30 | /30 |

## Quick notes

**What felt best on first open?**


**What felt too playful or too boring?**


**Copy preferences** (e.g. "Continue training" vs "Start mission"):


**Color / contrast issues:**


**Navigation label preference** (Console / Home / Deck):


## Decision

- [ ] **Balanced** — implement Sample A in production
- [ ] **Bold** — implement Sample B in production
- [ ] **Hybrid** — specify below

**Hybrid details (if applicable):**


**Approved by / date:**


---

After approval, next step is production implementation: replace `#home` in `index.html`, wire real data from `app.js` / `tools.js`, and add Sprint 2 features (flashcards, share, timed test).
