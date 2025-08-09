---
title: How to Extend
---

### How to Extend

Add a new skill
1. Create a `.guidance`/`.jinja` file under the target flow.
2. Register it in `flows.yaml` with `prompt_script: flows/<Flow>/<Skill>.nsl`.
3. Call it from existing skills or wire via a new `SendSystemEvent` consumer.

Example stub
```guidance
{{#system}}Explain what you intend to do.{{/system}}
{{#assistant}}{{Set(name="result", value=Gen(temperature=0.2))}}{{/assistant}}
{{Return(val=result)}}
```

Add a new connector action
- Branch on `GetCustomerAttribute(...)` to toggle behavior by project.
- Implement callback handler using `GetTriggeredAct(fields=...)`.

Schedule a reminder
```guidance
{{SendCommand(commandIdn="set_timer", integrationIdn="program_timer", personaId=userId, timerName="follow_up", interval="600", eventIdn="follow_up_fire")}}
```

Decision matrix
- Event or command? → side effect = command; orchestration = event
- Persona or state? → durable user data = persona; transient buffer = state
- LLM or rules? → extraction/generation = LLM; gating/validation = rules
