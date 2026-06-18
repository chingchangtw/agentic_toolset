## Skills & Agents Used
| Tool | Layer | Role |
|---|---|---|
| `ts-event-storming-facilitator` sub-agent | Layer D | Domain decomposition → exploration_output (events/commands/aggregates/bounded_contexts/pattern group) |
| `first-principles-agent` | Layer D | Challenge framing during `/ts-discover explore` → riskiest_assumptions |
| `council-advisor` | Layer D | Pressure-test H-risk assumptions during `/ts-discover validate` |
| `tows-strategy-analyst` | Layer D | Strategic fit during `/ts-discover validate` |
| `critical-thinker` | Layer D+1 | Challenge validation rationale; challenge epic sequencing in `/ts-iteration start` |
| `ts-deliver-router` | Layer 2 | Per-epic development spine |
| Atlassian Rovo MCP | Layer D+0+1 | Create Epics/Sprints; transition issues; publish retros |
| GitHub MCP | Layer 1 | Milestones; release tags; per-epic branches |
