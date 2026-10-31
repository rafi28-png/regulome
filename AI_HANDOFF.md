# 🤖 AI HANDOFF CONTEXT 

*(If you are an AI assistant opening this project on a new PC, read this document carefully to restore your context and memory of the project state!)*

**Hello fellow Antigravity instance!** 
This project has been transferred from the original developer's machine to this new one. You lack the historical conversation `brain` logs from the previous machine, so this document serves as your memory initialization.

### 1. Project Vision & Aesthetic
We are building a highly sophisticated, cinematic, and premium web application called **ReguloMe**, a regulatory genomics platform. 
- The style is NOT a basic "white text on black background."
- We use vibrant dark-mode styles, deep gradients, modern typography (like Inter/Outfit), subtle glassmorphism, and polished micro-animations.
- **Strict Rule:** Always prioritize high-end, dynamic design over simple minimum viable products.

### 2. What We Have Built So Far
- **Foundational Architecture:** The React+Vite app is structured properly.
- **Design System:** A robust design system has been established (colors, typography, utility classes).
- **Landing Page:** A fully designed, cinematic landing page is completed.
- **Backend Setup:** Initial FastAPI backend file structure (`backend/app/main.py`, `backend/app/core/config.py`, etc.) is in place with 12 routers and 11 services.
- **Core Components:** We've built structured UI components: `Button`, `GlassCard`/`StatCard`, `Badge`/`EvidenceBadge`, `Input`/`TextArea`, `Select`, `Modal`, `Drawer`, `ScoreGauge`, `Loaders`, `Primitives` (`Toggle`, `Tabs`, `ProgressBar`, `Skeleton`, `Tooltip`, `Divider`, `SectionHeader`).
- **App Shell:** `AppLayout` with animated sidebar (collapsible, mobile-responsive, section-grouped nav with 13 routes), `Topbar` with search and mode indicator.

### 3. Pages Completed (Parts 8–11)
- ✅ **LoginPage** — Premium split-layout with animated DNA visual, social login (Google/GitHub), email/password form, demo mode link, responsive design.
- ✅ **SignupPage** — Multi-step signup flow (3 steps: Account → Research Profile → Interest Areas) with animated step indicator, role selection cards, interest checklist.
- ✅ **DashboardPage** — Full command center with: persona greeting, regulatory age gauge, 4 stat cards, variant impact bar chart (Recharts), regulatory age trend area chart, tissue impact heatmap (12 tissues), disease risk bars (6 domains), top priority variants table, activity feed.
- ✅ **EvidenceStudioPage** — Evidence provenance explorer with: stats overview, full-text search, multi-facet filter panel (evidence level, tissue, element type, effect), sortable results, expandable evidence cards with confidence scores/source badges/metadata, data sources reference grid.
- ✅ **VariantExplorerPage** — Interactive variant browser with: summary stats bar, full-text search (rsID/gene/tissue/TF/disease), collapsible multi-facet filter panel, sortable table columns, bookmark toggling, copy rsID, click-to-navigate to detail view, 20 synthetic variant records.
- ✅ **VariantDetailPage** — Deep-dive view for a single variant with: hero header (gene/rsID/coordinates/badges + animated ScoreGauge), 4-card quick stats row, functional summary with molecular mechanism, evidence & provenance panel with source badges, tissue expression horizontal bar chart (Recharts), population allele frequencies, regulatory network flow diagram (TFs → variant → gene → pathway → disease), disease associations with odds ratios & risk bars, evidence timeline, related variants cards. Graceful "not found" fallback for invalid IDs.
- ✅ **GeneExpressionPage** — Tissue × gene expression landscape with: summary stats bar, search, interactive 15-gene × 10-tissue heatmap grid with hotspot indicators, clickable gene detail panel with bar chart, sortable gene rankings table, tissue overview cards.
- ✅ **NetworkAtlasPage** — D3.js force-directed regulatory network graph with: summary stats bar, search with connected-node expansion, interactive SVG graph (drag/zoom/click) with 39 nodes & 41 edges, node type filter legend, node detail panel showing connections, edge type legend. Nodes represent variants, TFs, genes, pathways, diseases, and tissues.
- ✅ **DiseaseHubPage** — **(Premium Design)** Disease domain explorer with: glassmorphism hero with decorative orbs, 6-card summary stats, 6 premium domain cards with animated SVG BurdenRing progress rings and gradient accent lines, Recharts RadarChart for multi-axis regulatory profile, animated risk variant table with gradient bars and evidence badges, cross-domain pathway connections with animated gradient lines showing shared genes.
- ✅ **EpigeneticClockPage** — **(God-Mode Design)** Biological age dashboard with: animated SVG gauge with tick marks and gradient stroke, floating orb hero, Recharts age trajectory chart (3 age lines + 1:1 reference), 5 clock model predictions (Horvath/Hannum/PhenoAge/GrimAge/DunedinPACE), 4×2 organ-specific age cards with hover lift, rejuvenation intervention targets with methylation position bars and optimal markers.
- ✅ **GenomeExplorerPage** — **(God-Mode Design)** 3D chromosome browser with: floating orb hero with 4 summary stats, horizontal chromosome selector (24 chromosomes), React Three Fiber 3D visualization (chromosome tube with color-coded TAD segments, regulatory annotation sphere markers, glow rings, orbit controls with auto-rotate), chromosome info card, element type legend with compartment key, dual-column TAD browser with insulation score bars, locus detail panel with variants/tissues/pathways/regulatory elements. Interactive TAD selection synced between 3D view and browser panels.

### 4. Synthetic Data
- `src/data/dashboardData.ts` — Dashboard stats, chart data, tissue impacts, disease risks, age trends, activity feed, top variants.
- `src/data/evidenceData.ts` — 10 real-world-inspired evidence records, 8 data sources, filter options, stats.
- `src/data/variantData.ts` — 20 regulatory variant records with comprehensive attributes, filter options, summary stats.
- `src/data/variantDetailData.ts` — Extended detail records for 20 variants (3 richly enriched: IL-6, MYC, APOE; 17 auto-generated defaults). Includes tissue expression scores, regulatory network graphs, disease associations, population frequencies, evidence timelines, and related variants.
- `src/data/geneExpressionData.ts` — 15-gene × 10-tissue expression matrix with fold changes, deviations, hotspot flags, gene summaries, tissue summaries.
- `src/data/networkAtlasData.ts` — 39-node regulatory network graph (6 variants, 8 TFs, 6 genes, 7 pathways, 6 diseases, 6 tissues) with 41 edges forming biological clusters.
- `src/data/diseaseHubData.ts` — 6 disease domains with radar categories, 16 disease-variant links, 8 cross-domain pathway connections, and summary stats.
- `src/data/epigeneticClockData.ts` — Subject profile, age trend data, 5 clock models, 8 methylation sites, 8 organ ages, 5 intervention targets.
- `src/data/genomeExplorerData.ts` — 24 chromosomes with sizes/gene counts/regulatory density, 16 TAD regions (chr1/6/17/19), 22 regulatory annotations, 9 locus details, element type config.

### 5. Spacing & Design Standards
- **AppLayout main padding:** `p-6 lg:p-10` (generous, matching landing page aesthetic)
- **Section gaps:** `space-y-8` between major sections
- **Grid gaps:** `gap-4 lg:gap-6` for card grids, `gap-5 lg:gap-6` for chart grids
- **Card inner padding:** `xl` (p-8) for dashboard section cards
- **Always use generous margins** between headings and content (mb-7 to mb-8 for section headers)

### 6. Pages Still Placeholder
The following pages are still using `PlaceholderPage` stubs:
- `SimulatorPage`, `ResearchWorkbenchPage`, `ReportCenterPage`, `HotspotAtlasPage`

### 7. Current Focus & Next Steps
1. **Simulator Page** — Regulatory Twin Simulator with intervention simulation.
2. **Hotspot Atlas Page** — Regulatory hotspot cluster visualization.
3. **Research Workbench Page** — Advanced filtering, saved views, exports.
4. **Report Center Page** — Generate downloadable reports.
5. **Backend Integration** — Connect frontend pages to FastAPI endpoints via fetch/axios.

### 7. How to Proceed
- If the user asks you to continue, immediately acknowledge this `AI_HANDOFF.md` document so they know you understand the project context.
- Maintain the exact same file paths and structural patterns we've already started. 
- Do NOT rewrite the styling rules; rely on the existing Tailwind and CSS design systems already created in the project.
- *Whenever you finish a major component or task, ensure you update THIS document to reflect the new state so the project remains perfectly portable.*
