---
title: DSL Syntax
---

### DSL Syntax

Blocks
- `{{#system}}...{{/system}}`
- `{{#assistant}}...{{/assistant}}`
- `{{#if condition}}...{{/if}}`
- Comments: `{{!-- ... --}}`

Control flow patterns
```guidance
{{#if IsEmpty(text=required_value)}}
  {{SendSystemEvent(eventIdn="urgent_message", baseInstruction="Missing required info: required_value")}}
  {{Return()}}
{{/if}}

{{StartNotInterruptibleBlock()}}
  {{SetPersonaAttribute(id=userId, field="state_flag", value="True")}}
  {{SendSystemEvent(eventIdn="extend_session")}}
{{StopNotInterruptibleBlock()}}
```

Composition (skills calling skills)
```guidance
{{_buildUserInformationSkill(userId=userId)}}
{{_utilsSetFollowUpTimerSkill(interval=_getFollowUpIntervalSkill(agentAnswer=agent_answer, userId=userId), personaId=userId)}}
```

Error handling idioms
- Fail fast with `Return()` when preconditions are not met.
- Prefer `urgent_message` to inform the user and recover gracefully.
- Log important events to `_utilsSendSystemLogSkill(message=...)`.

Events and Commands
```guidance
{{SendSystemEvent(eventIdn="analyze_conversation", convoAgentAnswer=answer)}}
{{SendCommand(commandIdn="create_event", integrationIdn="google_calendar", connectorIdn="calendar", startTime=time, attendees=attendees)}}
```

State & Memory
```guidance
{{Set(name="last_convo_actor_id", value=_utilsGetOrSetLastConvoActorId(userId=userId))}}
{{SetPersonaAttribute(id=userId, field="email", value=user_email)}}
{{SetState(name="fast_prompt", value=_makeFastPrompt(userId=userId))}}
{{Set(name="memory", value=GetMemory(count=30, maxLen=10000))}}
```

JSON helpers
```guidance
{{Set(name="payload", value=UpdateValueJSON(obj=payload, key="clientActorId", value=AsStringJSON(val=client_actor_id)))}}
{{Set(name="value", value=GetValueJSON(obj=some_json, key="field"))}}
{{Set(name="items", value=AppendItemsArrayJSON(array=items, items=new_item))}}
```
