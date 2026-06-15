┌─────────────────────────────────────┐
                    │  DISCOVERY (continuous, irregular)    │
                    │                                        │
   new idea ───────►│  idea → explore → validate ──┐         │
   (incl. feedback  │     ▲                         │         │
    from delivery)  │     └──── keep-learning ──────┤         │
                    │                                │         │
                    │                          build │ kill    │
                    │                                │  │       │
                    │                                ▼  ▼       │
                    │                    ready ──┐  killed+ADR  │
                    └────────────────────│────────┴────────────┘
                                          │
                                          ▼
                          .ai/discovery.json (status=ready)
                                          │
                              /project plan --sync
                                          │
                                          ▼
                    ┌─────────────────────────────────────┐
                    │  DELIVERY (release cadence)           │
                    │                                        │
                    │  /iteration start <release>           │
                    │       │                                │
                    │       ▼                                │
                    │  /iteration next  ◄──┐                 │
                    │       │              │ loop until      │
                    │       ▼              │ queue empty     │
                    │  lifecycle-router ────┘                │
                    │  (Think→...→Reflect)                   │
                    │       │                                │
                    │       │ unknown surfaced               │
                    │       └──────────────────► feedback ───┼──► new idea
                    │                                         │   (back to Discovery)
                    │  /iteration close                       │
                    └─────────────────────────────────────────┘