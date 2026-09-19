# Style Advisor - Implementation PRD & Development Checklist

## 1. Core Principles
- Concept: "Gain confidence with our style advisor. Remove the guesswork."
- Zero Hallucination: "The AI is allowed to have taste, but not facts."
  (Catalog code filtering -> LLM selects ID + calibrates formality + writes reasoning -> Validation -> UI Render)
- UI Philosophy: "Fitting Room" (Neutral, quiet, high contrast, serif headlines, no aggressive e-commerce dark patterns).

## 2. Technical Stack
- Framework: Next.js 14/15 (App Router, TypeScript, Tailwind CSS)
- LLM Integration: Claude 3.5 Sonnet / OpenAI GPT-4o API (JSON Mode)
- Data Storage: Local in-memory / JSON Catalog (~180 items) + LocalStorage for client persistence
- Container: Docker + Docker Compose

## 3. Engineering Checklist (Assigned to Jeremy)

### Phase 1: Environment & Scaffolding
- [x] Initialize Next.js repository with TypeScript, Tailwind CSS, Lucide-React.
- [x] Configure Tailwind design tokens for "Fitting Room" palette (`#F7F4EF`, `#1F2A44`, `#8A5A12`, `#3F6B4F`).
- [x] Dockerize app: write production-ready `Dockerfile` and `docker-compose.yml`.
- [x] Build mock dataset `data/catalog.json` adhering to the Garment Metadata Schema.


### Phase 2: Core Business Logic & AI Engine
- [x] Implement `lib/catalog-filter.ts`: Hard-filter candidates based on inputs (Gender, Budget, Occasion, Season).
- [x] Implement filter relaxation logic (Palette -> Style for Flow A; Lifestyle only for Flow B).
- [x] Implement `app/api/recommend/route.ts`:
  - [x] Enforce LLM JSON schema output.
  - [x] Inject candidate IDs only (no product names/URLs to LLM).
  - [x] Code validation: Verify returned IDs against catalog before returning payload.
  - [x] Implement deterministic caching using input hash keys.
  - [x] Enforce 15-second hard timeout with graceful fallback.


### Phase 3: Client State & UI Components
- [x] `lib/useProfileStorage.ts`: LocalStorage synchronization for the 9 profile variables.
- [x] `components/SharedProfile.tsx`: Single-page scrollable onboarding form with visual pickers.
- [x] Flow A View: Single decisive outfit card, serif reasoning block, ochre disclosure chips, and the Dislike Nudge (`[Too formal]`, `[Too casual]`, `[Not me]`).
- [x] Flow B View: 3 worked outfits, 15-item grid, Starter Set of 5 highlights, and asymmetric re-planning on "I have this".
- [x] Shared Cart & Empty-cart view ("You're ready. Wear what you have").
- [x] Research capture at Checkout: Email input + 1 WTP slider/question.


### Phase 4: Pre-flight & Demo Validation
- [x] Pre-flight script to ping all URLs in catalog to ensure 0 dead links (`scripts/verify-links.ts`).
- [ ] Pre-cache demo path: Sam (Pitching Seed Fund in Gastown).
- [ ] End-to-end benchmark test ensuring completion under 60 seconds.

