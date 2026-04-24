# Git Workflow

## Branch pattern

Use one branch per task:

- `feat/<task-name>`
- `fix/<task-name>`
- `docs/<task-name>`
- `test/<task-name>`
- `refactor/<task-name>`
- `chore/<task-name>`

## Commit pattern

Use Conventional Commit style:

- `feat: add raw Olist ingestion`
- `fix: correct PostgreSQL connection settings`
- `docs: expand architecture overview`
- `chore: update local environment setup`

## Helper scripts

Create a branch:

```powershell
.\scripts\new-task.ps1 -Type feat -Name "olist ingestion"
```

Commit and push the current branch:

```powershell
.\scripts\publish-task.ps1 -Type feat -Message "add initial Olist ingestion pipeline"
```

## Recommended flow

1. Create a task branch.
2. Make a focused change.
3. Run checks relevant to the task.
4. Publish with a clear commit message.
5. Open a Pull Request on GitHub.
