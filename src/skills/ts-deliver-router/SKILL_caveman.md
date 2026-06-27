---
name: ts-deliver-router
description: >
  Thin coordinator over verified state. Drives gstack 7-phase flow (Think→Plan→
  Build→Review→Test→Ship→Reflect) with nested Spectra BDD. Reads state.json as truth.
  Named checklist security gates block on human sign-off.
---

# ts-deliver-router (caveman)

Reads `.ai/ts-deliver-router/state.json` as truth. No inference.
Spine: Think→Plan→Build→Review→Test→Ship→Reflect.
All checks lazy-loaded per registry list.

## Autonomy (DIAL)
* HIGH: auto run. stops for taste + gates.
* MID: recommend next skills + wait approval. (default).
* LOW: stage names only.

## Router Algorithm
0 if dry-run: read-only, announce side effects, block sign-offs.
1 autonomy = read `.ai/ts-deliver-router/autonomy` || ask.
2 state = read `.ai/ts-deliver-router/state.json`. fail/stale → STOP.
3 P = current_phase. verify artifacts.
  if P == Think: check unknowns for hook criteria (a) blocks G1/G2, (b) affects >1 epic, (c) new external dep. If met, call `/ts-discover idea --from-router` (non-blocking).
4 consult registry for P: run always, suggest rec.
  if P == Build: check unknowns surfaced in always-checks against same hook criteria.
5 before exit P: all gates signed; G1/G2 require 100% check + human.
6 on exit: atomic state write.
7 where am i: show bracketed flow + active checks.
8 honor switches.

## Hard Safety
G1 (threat-model, end of Think) + G2 (sec-review, start of Ship) always block. HIGH never auto-signs.
Sign-off authenticity: signed_by/signed_at come ONLY from a human's literal response to a
blocking question this turn. Agent never authors these fields itself — no exceptions.
G1 warning: Surfaces unresolved linked Discovery ideas. Resolve or accept risk in notes.
Dry-run cannot bypass min-schema or persist state.
