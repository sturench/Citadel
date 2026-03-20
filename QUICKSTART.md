# Quickstart

From install to first `/do` command in 5 minutes.

## Prerequisites

- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** — the CLI tool this harness extends
- **[Node.js 18+](https://nodejs.org/)** — required for hooks and scripts

## 1. Copy the harness into your project

### macOS / Linux
```bash
git clone https://github.com/SethGammon/Citadel.git
cd your-project

# Copy harness directories (these won't conflict with existing code)
cp -r ../Citadel/.claude .
cp -r ../Citadel/.planning .
cp -r ../Citadel/scripts .

# If you don't have a CLAUDE.md yet, copy the starter
cp ../Citadel/CLAUDE.md .
```

### Windows (Command Prompt)
```cmd
git clone https://github.com/SethGammon/Citadel.git
cd your-project

xcopy /E /I ..\Citadel\.claude .\.claude
xcopy /E /I ..\Citadel\.planning .\.planning
xcopy /E /I ..\Citadel\scripts .\scripts
xcopy ..\Citadel\CLAUDE.md .\CLAUDE.md*
```

### Windows (PowerShell)
```powershell
git clone https://github.com/SethGammon/Citadel.git
cd your-project

Copy-Item -Recurse ..\Citadel\.claude .\.claude
Copy-Item -Recurse ..\Citadel\.planning .\.planning
Copy-Item -Recurse ..\Citadel\scripts .\scripts
Copy-Item ..\Citadel\CLAUDE.md .\CLAUDE.md
```

> **Note:** If your project already has a `.gitignore`, append the entries from the harness `.gitignore` rather than overwriting yours.

Or copy manually — the harness is just files, no build step.

## 2. Run setup

Open your project in Claude Code (`cd your-project && claude`), then:
```
/do setup
```

This will:

- Detect your language and framework
- Configure the typecheck hook for your stack
- Generate `.claude/harness.json` with your settings
- Create the planning directory structure
- Run a quick demo on your code

## 3. Start using it
```
/do review src/main.ts          # Code review
/do generate tests for utils    # Test generation
/do refactor the auth module    # Safe refactoring
/do scaffold a new API module   # Project-aware scaffolding
```

Or let the router figure it out:
```
/do fix the login bug
/do what's wrong with the API
/do build a caching layer
```

## 4. Create your first custom skill
```
/create-skill
```

It'll ask what patterns you keep repeating and generate a skill file that captures your knowledge permanently.

## What's Next

- Add your project's conventions to `CLAUDE.md` — the more specific, the better
- Read `docs/SKILLS.md` to understand how skills work
- Try `/marshal "audit the codebase"` for a multi-step investigation
- Try `/archon "build [large feature]"` for multi-session campaigns
- Try `/fleet "overhaul all three modules"` for parallel execution
