# registry/index — DIAL + types + recipe + exclusions

Loaded with every registry-<phase>.md call. Defines behavior shared across all phases.

## DIAL (autonomy)
HIGH=auto: run chain end-to-end; stop only taste+security gates; print artifacts+token cost per phase.
MID=recommend (DEFAULT): name phase + next skill(s)/checks; wait approve each step.
LOW=suggest: name phase only; no skill names.
First use→ask "Autonomy? HIGH/MID/LOW", save to `.ai/ts-deliver-router/autonomy`.
Switch: "go auto"→HIGH | "recommend"→MID | "suggestions only"→LOW.
Downshift always ok; upshift re-confirms before destructive/security step.
Safety override: gates always pause for human even in HIGH; HIGH never auto-signs.

## Check types
always = continuous, non-blocking (runs throughout the phase).
gate  = blocks phase exit until passed or signed_off.
rec   = surfaced by router; operator may skip.
* security gate → pause for human even in HIGH; HIGH never auto-signs.

## Add an activity (recipe)
Pick phase + type + trigger + skill → append ONE row to the matching registry-<phase>.md.
Never edit the spine or the router.
Swap placeholders (<SAST tool>, <dep/secrets scanner>, <mutation tool>, coverage >= <X>%) per project.

## Not a row — by design
critical-thinker     removed; too heavy for runtime.
url-safety-validator G2 checklist item; one control, one home (security-gates.md).
atlassian-rest-api   invoked inside Build work; not a lifecycle gate.
mastery-tutor        learner-facing; outside build lifecycle.
anthropics/skills    REFERENCE catalog; no runtime row; consulted by harvest-skill in Reflect.
mattpocock (Think)   no Think skills; TS tooling only → registry-build.md.
