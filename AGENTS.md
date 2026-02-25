# Agent Rules

## Project Documentation Source

- The project documentation (GDD) lives in the Git submodule at `game-design-docs/`.
- Before starting feature work, make sure the submodule is available:
  - `git submodule update --init --recursive game-design-docs`
- Use these files as the primary reference for game/domain behavior:
  - `game-design-docs/README.md`
  - `game-design-docs/rule.md`
  - `game-design-docs/class-system.md`
  - `game-design-docs/level-system.md`
  - `game-design-docs/milestone.md`
- If implementation conflicts with these docs, ask for clarification before changing behavior.

## Planning Output Rule

- When the user asks for a plan (or requests planning output), always write the plan into the root `plans/` folder.
- Create `plans/` if it does not exist.
- All plan documents in `plans/` must be written in Vietnamese with full diacritics (tiếng Việt có dấu).

## Feature Application Structure Rule

- When reorganizing any `src/features/*/application` folder, follow the same structure style as `src/features/auth/application`:
  - Split use-cases into subfolders (for example: `create/`, `list/`, `login/`, `register/`).
  - Keep `<feature>.application-service.ts` as an orchestration layer that delegates to use-case services.
  - Add `index.ts` barrel exports at application root and each use-case subfolder.
  - Prefer importing from barrel paths in controllers/modules instead of deep file paths.
- After refactoring feature application structure, run endpoint smoke tests with `curl` for affected flows.
- If runtime dependencies (database/redis/services) are unavailable in the current environment, explicitly report the blocker and provide exact `curl` commands for local verification.

## Feature Docs Update Rule

- After completing implementation for any feature, update or create the feature docs at:
  - `src/features/<feature>/application/docs.md`
- The docs update must include at least:
  - affected endpoints,
  - required headers/authentication,
  - sample request (`curl`) for the main flow.
- If a new feature docs page is added, update the API portal links (currently in `assets/md/swagger-home.md`) so users can navigate to it.

## Docs UI Rule

- Keep docs navigation centered on the new pages:
  - API portal: `/`
  - feature docs: `/docs/<feature>` (for example: `/docs/auth`, `/docs/character`)
  - Swagger pages are for API calling/testing, docs pages are for explanation.
- In feature docs pages, present routes in collapsible sections (default collapsed). Each route section must include:
  - route description,
  - input schema,
  - output schema,
  - error messages with descriptions.
- Maintain a gentle visual style for docs pages with readable contrast (do not use overly strong/saturated colors).
- Use one unified color system across all docs pages; do not assign different global themes per page.
- Color variety should happen inside each page via subtle accents for sections/components (for example headings, route summaries, tables), while keeping the overall palette consistent.
