---
title: LLM Generation
---

### LLM Generation

Gen
- Use for non-streaming outputs and schema validation.
```guidance
{{Set(name="schema", value=_schemasSkill(conversationQuality="True"))}}
{{Set(name="conversation_quality_score", value=Gen(jsonSchema=schema, validateSchema="True", temperature=0.2, topP=0))}}
```

GenStream
- Stream answers to current actor.
```guidance
{{Set(name="agent_answer", value=GenStream(interruptMode="interruptWindow", interruptWindow=0.7, temperature=0.2, sendTo="actors", actorIds=_utilsGetOrSetLastConvoActorId(userId=userId)))}}
```

Tool-calling via schema
```jinja
{% set tools_to_call_schema = json.loads(get_tools_to_call_schema()) %}
{{assistant}}
{% set tools_object = Gen(jsonSchema=tools_to_call_schema, validateSchema="True", temperature=0.2, topP=0, maxTokens=4000) %}
{{end}}
{{Return(val=tools_object["toolToCall"])}}
```

Bake/validate loop (workers)
```guidance
{{Set(name="task_object", value=Gen(...))}}
{{Set(name="task_object_ok", value=Gen(...))}}
{{#if IsSimilar(val1=task_object_ok, val2="True", threshold=0.7)}}
  {{_findMissedFieldsSkill(taskObject=task_object, taskIdn=task_idn)}}
{{else}}
  {{_bakeSkill(isRetriable="False")}}
{{/if}}
```

Prompt blocks
- Surround system and assistant contexts with `#system` and `#assistant` blocks for clarity.

Schemas
- Provide `jsonSchema` for structured extraction; validate with `validateSchema="True"`.

Tips
- Keep temperature low for tool-use and extraction; increase for creative generation.
- Store important outputs in persona or state variables immediately after generation.
