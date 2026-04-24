# Repository Instructions

## Working agreement

- Evaluate each code change before committing or pushing.
- Explicitly decide whether a change is worth publishing now or should stay local until it is more complete.
- Prefer publishing only coherent, reviewable, portfolio-quality changes.

## Git and GitHub workflow

- Do not commit or push temporary debugging changes, incomplete experiments, or local-only noise.
- Never commit secrets or local environment files such as `.env`.
- Use clear professional commit messages following this pattern:
  - `feat: ...`
  - `fix: ...`
  - `docs: ...`
  - `test: ...`
  - `refactor: ...`
  - `chore: ...`
- When a change is worth publishing, prefer a focused branch and push it with a clean commit history.

## Default collaboration behavior

- After making changes, state one of these outcomes:
  - `vale subir agora`
  - `melhor nao subir ainda`
- If the change is worth publishing, proceed with commit and push unless the user asks otherwise.
- If the change is not worth publishing yet, explain briefly what is missing before pushing.
