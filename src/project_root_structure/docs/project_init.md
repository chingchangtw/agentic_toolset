# Project Initialization
## ponytail
-Claude
-Copilot

## claude-mem

## Graphify

## Caveman 
every project needs to run
- Claude : talk like caveman
- Copilot : /caveman lite 

## spectra
- spectra

## code-review-graph
- enable per repo by 
execute cd my-project && code-review-graph build

## misc. Claude Skills
npx skills add ratacat/claude-skills@clean-code -g -y 2>&1
npx skills add ratacat/claude-skills@design-patterns -g -y 2>&1


npx skills add ratacat/claude-skills@modern-web-app-architecture -g -y 2>&1
npx skills add ratacat/claude-skills@web-interface-design -g -y 2>&1


### VoltAgent/awesome-agent-skills


## MCP
have Playwright if web design
have firecrawl if web/data crawling
have Chrome MCP extension if web design & operation

<!-- ######################## -->

# Global Installations and Configurations
## Superpowers
- Superpowers global plugin installation 
    install superpower https://github.com/obra/superpowers
    /plugin install superpowers@claude-plugins-official

    gemini extensions install https://github.com/obra/superpowers
    
    copilot plugin marketplace add obra/superpowers-marketplace
        copilot plugin install superpowers@superpowers-marketplace

<!--
- Claude Code Plugins Directory
    /plugin install {plugin-name}@claude-plugins-official

- Claude code skills
    /plugin marketplace add anthropics/skills
--> 

## mattpocock/skills
- mattpocock/skills
npx skills@latest add mattpocock/skills -g
/setup-matt-pocock-skills

- - Copilot CLI
/skills add ~/.agents/skills in 

## code-review-graph
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

## caveman
npx -y github:JuliusBrussee/caveman -- --only copilot

Create the global Copilot instructions file:
<!--
mkdir -p ~/.copilot
nano ~/.copilot/copilot-instructions.md

Add:

Respond terse like smart caveman. All technical substance stay. Only fluff die.

Rules:
- Drop articles, filler, pleasantries, hedging
- Fragments OK
- Technical terms exact
- Code unchanged
- Pattern: [thing] [action] [reason] [next step]
-->

## Claude Skills
npx skills add ratacat/claude-skills@clean-code -g -y 2>&1
npx skills add ratacat/claude-skills@design-patterns -g -y 2>&1



npx skills add ratacat/claude-skills@modern-web-app-architecture -g -y 2>&1
npx skills add ratacat/claude-skills@web-interface-design -g -y 2>&1


## personal skills
- personal skills