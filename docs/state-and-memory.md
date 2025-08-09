---
title: State and Memory
---

### State and Memory

Persona state (durable per user)
- Set/Get persona attributes with clear names; prefer namespacing like `action_state_*`, `intercom_*`, `working_hours_*`.
- Example caching pattern:
```guidance
{{Set(name="working_hours_status", value=GetPersonaAttribute(id=userId, field="working_hours_status"))}}
{{#if IsEmpty(text=working_hours_status)}}
  {{Set(name="working_hours_status", value=_getWorkingHoursStatus(userId=userId))}}
  {{SetPersonaAttribute(id=userId, field="working_hours_status", value=working_hours_status)}}
{{/if}}
```

Local/transient state
- `SetState` for buffers like `fast_prompt`, `user_reply_buffer`, `corrected_memory`.

Memory and context
- Use `GetMemory` with date ranges and `filterByActorIds` to focus.

Invalidation
- Reset flags on session start (`_utilsResetSessionStateSkill`), or after operations complete.

Actors and users
- Create missing actors when sending SMS or using intercom; store IDs in persona fields for reuse.

Guarded execution
- Use `StartNotInterruptibleBlock/StopNotInterruptibleBlock` around state mutations coupled with external effects.
