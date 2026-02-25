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
