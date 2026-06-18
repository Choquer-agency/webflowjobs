# Webflow.jobs — 12-Week SEO Strategy (Q3 2026)
## From Content Breadth → Authority, Programmatic Scale & Conversion

**Prepared:** June 18, 2026
**Plan window:** Week 1 starts Monday, June 23, 2026 → Week 12 ends Sunday, September 14, 2026
**Data source:** SE Ranking (live pull, June 18 2026) + on-site analysis
**Predecessor:** `CONTENT-STRATEGY.md` (90-day content plan — ✅ complete, 30 articles + template pack shipped)

---

## 0. How this plan was built (and which skills run each workstream)

Every number below is pulled **live from SE Ranking**, not estimated. Each workstream maps to a Claude skill/subagent you already have installed — run these to execute, don't do it by hand:

| Workstream | Skill / Agent to run | What it does |
|---|---|---|
| Programmatic page build-out | `seo-programmatic` | URL patterns, templates, thin-content safeguards, index-bloat prevention |
| Comparison / "vs" / alternatives pages | `seo-competitor-pages` | X-vs-Y layouts, feature matrices, schema |
| Topic clustering + internal links | `seo-cluster` | SERP-overlap clustering, hub-and-spoke, link matrix |
| AI / answer-engine visibility | `seo-geo` + `seo-seranking` | llms.txt, citability, AI Share-of-Voice across 5 engines |
| Backlink campaign | `seo-backlinks` (+ `seo-ahrefs`) | Referring-domain gap, anchor health, link prospecting |
| Technical + schema | `seo-technical`, `seo-schema` | Crawl, JobPosting/FAQ/Breadcrumb JSON-LD |
| Full audit / health score | `seo-audit` | 15-specialist parallel crawl, baseline + ongoing |
| Per-article briefs | `seo-content-brief` | Section-level briefs with word counts |
| Live data + tracking | SE Ranking MCP | Rank tracking, SERP, keyword metrics, AI overview |

---

## 1. Where we are today (the honest baseline)

Pulled from SE Ranking on June 18, 2026:

| Metric | Current value | Read |
|---|---|---|
| Organic keywords (worldwide) | **206** | Tiny but real; 35 in US, 21 AU, 16 CA, 15 UK |
| Organic traffic (worldwide) | **~94 visits/mo** | 33 of those in the US |
| Keywords in US top 10 | **~5** | webflow career #6, webflow developer job(s) #7–8, seo specialist salary #10 |
| Keywords stuck on page 2–3 (pos 11–40) | **20+** | The single biggest near-term opportunity |
| Backlinks / referring domains | 46 / 36 | Volume is fine for age… |
| **Dofollow referring domains** | **7** | …but link *equity* is the real bottleneck |
| InLink Rank (page authority) | **4 / 100** | Low. Domain InLink Rank 28. |
| Nofollow share | 32 of 46 (70%) | Over-weighted to branded/nofollow anchors |
| AI search — brand presence | 1 | Recognized brand ("Webflow Jobs"), barely cited |
| AI search — link presence | 2 | AI opportunity traffic still ~0 |

**Three facts that shape the entire plan:**

1. **You already rank — just on page 2.** "webflow developers" (vol 480) sits at **#22**, "webflow developer" (480) at **#27**, "webflow dev" (170) at **#26**. These don't need new content; they need an on-page + internal-link + authority push to crack page 1. This is the fastest traffic in the plan.
2. **Your one real competitor wins with programmatic pages, not better writing.** See §2. You have the route scaffolding to beat them in a weekend.
3. **Your content already earns links and SGE slots.** The SEO Salary Guide pulled **10 backlinks / 3 referring domains** on its own; job pages already rank **#1 in the SGE/AI block** for "webflow new jersey" and "boulder webflow developer." The model works — now scale it.

---

## 2. Competitive analysis — flowroles.com teardown

SE Ranking flags **flowroles.com** as the only meaningful organic competitor (13 shared keywords, **62 visits/mo vs your 33** — they're ~2× you on the same terms). Here's *how* they beat you:

| flowroles winning URL pattern | Ranks for | Volume | You have this? |
|---|---|---|---|
| `/webflow-jobs/role/developer` | webflow developer jobs (#6, #16) | 140 | ❌ (you have `/jobs/category` scaffolding — unused) |
| `/webflow-jobs/work/remote` | webflow developer jobs, careers | 140/180 | ❌ |
| `/webflow-jobs/location/united-states` | webflow career, developer job | 180/140 | ❌ |
| `/webflow-jobs/type/freelance` | webflow freelancer/freelance | 90 | ❌ |
| `/webflow-agencies` | **webflow agency (#29)** | **480** | ❌ — *zero coverage, L/C intent, local pack* |
| `/companies/8020-inc` | 8020 agency, 8020 jobs | 50/50 | ⚠️ (you have `/companies/[slug]` route — underbuilt) |

**The takeaway:** flowroles isn't out-writing you — they've built a **programmatic faceted system** (role × work-type × location × company × agency) that mints dozens of indexable, intent-matched pages. Their pages are thin and beatable; you already have richer job data (Convex) and the `/jobs/category/[category]` + `/companies/[slug]` routes half-built. **Closing this gap is Phase 2 and the highest-leverage move in the quarter.**

The "webflow agency" directory (480 vol, commercial intent, triggers a local pack) is a standout: **a single new `/agencies` hub can capture a keyword you currently rank nowhere for.**

---

## 3. Keyword opportunity matrix (all volumes & KD verified in SE Ranking, US)

### 3.1 🟢 Quick wins — low difficulty, surging or commercial (Weeks 1–6)

| Keyword | Volume | KD | Note |
|---|---|---|---|
| **webflow cms** | 720 | 31 | Stable, informational, big |
| **webflow vs framer** | 590 | **9** | 🔥 surged 10→590 in May 2026 — ride the wave NOW |
| **webflow ecommerce** | 590 | **10** | 🔥 surged 40→590 in Apr 2026 |
| **webflow tutorial** | 480 | 22 | Top-of-funnel, feeds everything |
| **webflow agency** | 480 | 29 | Commercial, competitor-owned → directory page |
| **webflow review** | 390 | 16 | Bottom-funnel, decision-stage |
| **webflow alternative** | 320 | **6** | 🔥 lowest-KD high-vol term on the board |
| **framer jobs** | 260 | **7** | Adjacent-platform expansion (new audience) |
| **webflow expert** | 260 | 19 | **CPC $11.36** — high commercial value |
| **webflow certification** | 170 | 17 | Career-intent, links to existing article |
| **web designer salary** | 480 | **12** | Easy salary term, pairs with existing cluster |
| **no code developer jobs** | 90 | **6** | Job-board intent, programmatic fit |
| **framer vs webflow** | 10 | 9 | Capture both directions of the comparison |

### 3.2 🟡 Page-2 rescues — already ranking, push to page 1 (Weeks 1–3)

These cost almost nothing — they're on-page + internal-link + authority pushes, not new articles.

| Keyword | Volume | Current pos | Target |
|---|---|---|---|
| webflow developers | 480 | #22 | top 10 |
| webflow developer | 480 | #27 | top 15 |
| webflow dev | 170 | #26 | top 15 |
| webflow website designer(s) | 110 | #22–26 | top 15 |
| webflow web designer | 110 | #14 | top 8 |
| hire webflow designer | 50 | #21 | top 10 |
| webflow freelancers | 90 | #29 | top 15 |
| webflow freelance | 90 | #32 | top 15 |

### 3.3 🔵 Pillar / high-volume (long-game, Weeks 7–12 — expect slower movement at InLink Rank 4)

| Keyword | Volume | KD | Vehicle |
|---|---|---|---|
| graphic designer salary | 4,400 | 70 | Salary hub (high competition — be patient) |
| ux designer salary | 3,200 | 66 | Existing article — strengthen |
| webflow templates | 3,200 | 70 | Resource/gallery play |
| webflow pricing | 1,900 | 67 | Decision-stage guide |

> **Reality check:** at InLink Rank 4, KD 60–70 terms are 2–3 quarter plays, not 12-week wins. We target them with content now so they *age* while we build links — but the **traffic this quarter comes from §3.1 and §3.2.**

---

## 4. Goals & KPIs (measured in SE Ranking, baseline → 12-week target)

| KPI | Baseline (Jun 18) | Week-12 target | How |
|---|---|---|---|
| Organic keywords (WW) | 206 | **600+** | Programmatic pages + comparison cluster |
| Organic traffic (WW) | ~94/mo | **400–500/mo** | Page-2 rescues + quick wins + programmatic |
| US keywords in top 10 | ~5 | **25+** | §3.1 + §3.2 |
| Dofollow referring domains | 7 | **25+** | Data report + digital PR (§8) |
| InLink Rank | 4 | **10+** | Link campaign |
| Pages indexed & ranking | ~30 content + jobs | **150+** | Programmatic build-out |
| AI brand presence (SE Ranking) | 1 | **rising trend, ≥1 cited answer/engine** | GEO (§9) |
| Tracked keywords in project 11007131 | 10 | **60** | Week 1 setup |

---

## 5. Strategic pillars for Q3

1. **Programmatic SEO** — match and beat flowroles' faceted system (role × work-type × location × company + agency directory).
2. **Bottom-funnel comparison content** — capture the surging low-KD "vs / alternative / review / cms / ecommerce" cluster.
3. **Page-2→Page-1 optimization** — squeeze the 20+ keywords already ranking 11–40.
4. **Authority / link building** — fix the #1 bottleneck with a data report + digital PR.
5. **GEO / answer-engine optimization** — convert nascent AI presence into citations.
6. **Technical & schema foundation** — JobPosting/FAQ/Breadcrumb JSON-LD so programmatic pages earn rich results and AI parsing.

---

## 6. The 12-week roadmap

### PHASE 1 — Foundation & Quick Wins (Weeks 1–3)

**Week 1 (Jun 23–29) — Instrument & audit**
- Run `seo-audit` for a full baseline + health score; run `seo-technical` + `seo-schema` on `/jobs/[slug]`, `/companies/[slug]`, `/resources/[slug]`.
- Expand SE Ranking project 11007131 from 10 → **60 tracked keywords** (all of §3.1, §3.2, plus brand + programmatic heads).
- Ship **JobPosting schema** on every `/jobs/[slug]` (you already win SGE here — schema compounds it), **FAQPage schema** on resources with FAQ blocks, **BreadcrumbList** site-wide.
- Publish `llms.txt` and confirm AI crawler access (GPTBot, ClaudeBot, PerplexityBot, Google-Extended) — input for `seo-geo`.

**Week 2 (Jun 30–Jul 6) — Page-2 rescue sprint**
- On-page optimization pass on the §3.2 keywords: title/H1/answer-capsule alignment, add internal links *from* the 30 published resource articles *to* the homepage and `/designers` for "webflow developer(s)/dev/designer" terms.
- Add a contextual internal-link module to all resource articles pointing at the money pages (`/jobs`, `/hire-webflow-developer`, `/post-a-job`).
- Refresh "Last Updated" dates + tighten meta titles on the 8 rescue targets.

**Week 3 (Jul 7–13) — Comparison cluster kickoff**
- Run `seo-competitor-pages`. Publish first 3 bottom-funnel pages:
  - **Webflow vs Framer (2026)** → `webflow vs framer` (590, KD 9) + `framer vs webflow` (10, KD 9)
  - **Best Webflow Alternatives (2026)** → `webflow alternative` (320, KD 6)
  - **Webflow Review (2026): Honest Pros, Cons & Who It's For** → `webflow review` (390, KD 16)
- Each: comparison table, answer capsule, FAQ schema, internal links to job board + relevant role articles.

### PHASE 2 — Programmatic Build-out (Weeks 4–7) ← highest leverage

Run `seo-programmatic` first to lock URL patterns, templates, and thin-content gates (min job count per facet, noindex empty facets, canonical rules).

**Week 4 (Jul 14–20) — Role & work-type facets**
- Build `/jobs/category/[category]` out properly (route already exists): Developer, Designer, UX/UI, SEO, Copywriter, Motion, PPC, CRO, Project Manager, Marketing Director — each a real indexable hub with intro copy, live listings, FAQ, schema.
- Add work-type facets: `/jobs/remote`, `/jobs/freelance`, `/jobs/contract`, `/jobs/full-time` → targets "webflow developer jobs", "webflow freelancer", "no code developer jobs".

**Week 5 (Jul 21–27) — Location facets**
- `/jobs/location/[city|state]` for top US metros (NYC, LA, SF, Austin, Chicago, Denver, Miami, Seattle, Boston, Remote-US). You already hit **#1 SGE** for "boulder webflow developer" — systematize it.
- Thin-content guard: only index a location page when it has ≥N live jobs; otherwise noindex + redirect to Remote-US.

**Week 6 (Jul 28–Aug 3) — Company & Agency directories**
- Flesh out `/companies/[slug]` (route exists) into real company-profile pages (jobs + about + schema) → captures "[company] jobs/agency" long tail like flowroles' `/companies/8020-inc`.
- **NEW: `/agencies` hub + `/agencies/[slug]`** → directly attacks **"webflow agency" (480, KD 29, commercial, local pack)** — a keyword you rank nowhere for and flowroles owns. This is the single biggest individual gap.

**Week 7 (Aug 4–10) — Internal linking & crawl**
- Run `seo-cluster` to generate the hub-and-spoke internal-link matrix tying programmatic facets ↔ resource articles ↔ money pages.
- Submit updated XML sitemap(s) (`seo-sitemap`), verify indexation in GSC, fix orphan pages.

### PHASE 3 — Commercial Content & Tools (Weeks 8–10)

**Week 8 (Aug 11–17) — Commercial/decision content**
- **Hire a Webflow Expert** page → `webflow expert` (260, **CPC $11.36**) + `hire webflow expert` (30, CPC $15.70). High-value commercial intent.
- **Webflow CMS Guide** → `webflow cms` (720, KD 31). **Webflow for Ecommerce** → `webflow ecommerce` (590, KD 10).

**Week 9 (Aug 18–24) — Platform-expansion + tutorial top-funnel**
- **Framer Jobs** facet/landing → `framer jobs` (260, KD 7): widen the audience beyond Webflow (same creative talent pool).
- **Webflow Tutorial / Learn Webflow** hub → `webflow tutorial` (480), `learn webflow` (70), `webflow certification` (170) — links down into career articles.

**Week 10 (Aug 25–31) — Interactive tools (carryover from Plan 1, still outstanding)**
- Ship the **Webflow Rate Calculator** and **Salary Calculator** (linkable, embeddable assets that feed Phase 4 link building). These were slotted in the first plan and never built — they're worth more now as link bait.

### PHASE 4 — Authority, Data Report & GEO (Weeks 11–12)

**Week 11 (Sep 1–7) — Linkable data report + PR**
- Publish **"State of Webflow Jobs Q3 2026"** from your proprietary Convex listing data (salary trends, most-in-demand roles, remote %, top hiring companies). Your salary guide already earned 10 links unaided — a data report is the strongest link magnet you can make.
- Run `seo-backlinks`: referring-domain gap vs flowroles, prospect list, fix anchor over-optimization (currently 70% nofollow/branded). Outreach: niche directories, Webflow community, no-code newsletters, HARO-style expert quotes, the agencies you list (reciprocal profile links).

**Week 12 (Sep 8–14) — GEO push + quarter review**
- Run `seo-geo` + `seo-seranking`: measure AI Share-of-Voice across ChatGPT, Perplexity, Gemini, AI Overviews, AI Mode. Optimize the comparison + salary pages for citation (definitive answer capsules, stat tables, FAQ schema — the formats AI extracts).
- **Quarter review:** re-pull the §1 baseline table in SE Ranking, score against §4 KPIs, and seed the Q4 plan (double down on whatever facet/cluster moved fastest).

---

## 7. Programmatic SEO architecture (the core build)

```
/jobs/category/[role]      → Developer, Designer, UX/UI, SEO, Copywriter, Motion, PPC, CRO, PM, Marketing Dir
/jobs/[worktype]           → remote, freelance, contract, full-time
/jobs/location/[geo]       → top 10 US metros + Remote-US  (index only when ≥N live jobs)
/companies/[slug]          → company profile + their live roles
/agencies                  → "webflow agency" hub (480 vol)  ← NEW, highest-gap page
/agencies/[slug]           → individual agency profiles
```

**Guardrails (enforce via `seo-programmatic`):**
- Minimum live-job threshold before a facet is indexable (kills thin/empty pages → no index bloat).
- Unique intro + FAQ per facet (not just a filtered list) so pages aren't doorway-thin.
- Self-referencing canonicals; noindex,follow on empty/duplicate facet combos.
- `JobPosting` + `BreadcrumbList` + `ItemList` schema on every facet.
- Each facet links up to its parent hub and across to 2–3 relevant resource articles.

---

## 8. Link-building plan (fixing the #1 bottleneck)

Target: **7 → 25+ dofollow referring domains; InLink Rank 4 → 10+.**

1. **Data report** ("State of Webflow Jobs Q3 2026") — pitch to Webflow newsletters, no-code communities, design publications. Original data = citations.
2. **Free tools** (rate + salary calculator) — embeddable, naturally linked by blogs writing about freelance pricing.
3. **Reciprocal directory equity** — your `/companies` and `/agencies` profiles give listed companies a reason to link back ("View our Webflow jobs on Webflow.jobs").
4. **Expert quotes / HARO-style** — Bryce as a named source on Webflow hiring & salary trends (also strengthens E-E-A-T + author entity).
5. **Anchor health** — current profile is 70% nofollow and over-concentrated on branded "webflow.jobs"; diversify toward partial-match ("webflow developer jobs", "hire webflow experts").
6. **Niche citations** — no-code/Webflow tool directories, job-board aggregators, startup job lists.

---

## 9. GEO / answer-engine plan

AI presence is nascent (brand 1, link 2, avg AI position 8). SGE already appears on "webflow developer", "seo specialist salary", "webflow vs framer" SERPs — so AI Overviews are deciding these queries *now*.

- **llms.txt** + confirmed AI-crawler access (Week 1).
- **Answer-capsule discipline** (already in your articles) extended to every programmatic + comparison page.
- **Stat-dense tables + FAQ schema** — the formats LLMs extract; comparison and salary pages are prime citation targets.
- **Entity building** — consistent "Webflow Jobs" brand + Bryce author entity across data report and quotes.
- **Measure** with `seo-seranking` AI Share-of-Voice (all 5 engines) monthly; treat AI citations as a first-class KPI, not an afterthought.

---

## 10. Technical & schema checklist (Week 1, maintained throughout)

- [ ] `JobPosting` JSON-LD on all `/jobs/[slug]`
- [ ] `FAQPage` on every page with a FAQ block (resources + facets + comparisons)
- [ ] `BreadcrumbList` site-wide
- [ ] `Organization` + `WebSite` (with `SearchAction`) on homepage
- [ ] `ItemList` on job/category facet pages
- [ ] `Article` (✅ already live on resources) — add `author` entity
- [ ] XML sitemap split (jobs / resources / facets / companies) + GSC submission
- [ ] Canonicalization + noindex rules for thin facets
- [ ] CWV/INP check (`seo-performance`) — Next.js rebuild should pass; verify after programmatic build
- [ ] `llms.txt` + robots AI-crawler allowlist

---

## 11. Weekly cadence summary

| Phase | Weeks | Theme | Primary skill(s) | Headline deliverable |
|---|---|---|---|---|
| 1 | 1–3 | Foundation & quick wins | seo-audit, seo-technical, seo-schema, seo-competitor-pages | Schema live + page-2 rescues + first 3 comparison pages |
| 2 | 4–7 | Programmatic build-out | seo-programmatic, seo-cluster, seo-sitemap | Role/work/location/company facets + `/agencies` hub |
| 3 | 8–10 | Commercial content & tools | seo-content-brief, seo-competitor-pages | Expert/CMS/Ecommerce pages + rate & salary calculators |
| 4 | 11–12 | Authority, data & GEO | seo-backlinks, seo-geo, seo-seranking | Q3 data report + link campaign + AI-visibility push |

---

## 12. What to watch / risks

- **Authority ceiling:** at InLink Rank 4, expect KD <30 terms to move in weeks, KD 60–70 to lag a quarter+. Don't judge pillar pages on a 12-week clock — judge them on links earned.
- **Thin programmatic pages** are the main downside risk — the §7 guardrails are non-negotiable; index bloat can hurt the whole domain.
- **Comparison-keyword volatility:** "webflow vs framer" and "webflow ecommerce" spiked recently (10→590, 40→590). Move fast while KD is 9–10; these windows close.
- **Don't drop the job-data moat:** your live Convex listings are the unfair advantage in both programmatic pages and the data report — keep ingestion healthy.
