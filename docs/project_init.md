- Caveman 
    https://github.com/JuliusBrussee/caveman
    # macOS / Linux / WSL / Git Bash
    curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash

    # Windows (PowerShell 5.1+)
    irm https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.ps1 | iex

- - init in repo level : curl -fsSL https://raw.githubusercontent.com/JuliusBrussee/caveman/main/install.sh | bash -s -- --with-init



- - every project needs to run
- - - Claude talk like caveman
- - - Copilot 
npx skills add JuliusBrussee/caveman -a github-copilot in repo

- Superpowers
    install superpower https://github.com/obra/superpowers
    /plugin install superpowers@claude-plugins-official
    gemini extensions install https://github.com/obra/superpowers
    copilot plugin marketplace add obra/superpowers-marketplace
        copilot plugin install superpowers@superpowers-marketplace
- Claude Code Plugins Directory
    /plugin install {plugin-name}@claude-plugins-official

- Claude code skills
    /plugin marketplace add anthropics/skills

- install mattpocock/skills
npx skills@latest add mattpocock/skills
/setup-matt-pocock-skills

- code-review-graph
    pip install code-review-graph                     # or: pipx install code-review-graph
    code-review-graph install          # auto-detects and configures all supported platforms
    code-review-graph build            # parse your codebase

-- To target a specific platform:
code-review-graph install --platform codex       # configure only Codex
code-review-graph install --platform cursor      # configure only Cursor
code-review-graph install --platform claude-code  # configure only Claude Code
code-review-graph install --platform gemini-cli   # configure only Gemini CLI
code-review-graph install --platform kiro         # configure only Kiro
code-review-graph install --platform copilot      # configure only GitHub Copilot (VS Code)
code-review-graph install --platform copilot-cli  # configure only GitHub Copilot CLI

- spectra

- personal skills