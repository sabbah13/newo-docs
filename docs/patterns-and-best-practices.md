---
title: Patterns and Best Practices
---

### Patterns and Best Practices

Do
- Event-first orchestration; commands only for side effects
- Guard critical regions; extend timers before long ops
- Schema-first extraction for reliability
- Persist canonical state in persona attributes
- Log important steps to system log skills

Avoid
- Emitting commands without validating prerequisite state
- Generating JSON without validating against schemas
- Relying solely on `IsSimilar` for critical checks
- Overwriting persona fields without backups

Checklists
- [ ] Preconditions validated
- [ ] Timers set/extended if needed
- [ ] Persona state updated atomically within a not-interruptible block
- [ ] Appropriate events emitted for observers/RAG
- [ ] User informed (urgent_message) on blocking issues
