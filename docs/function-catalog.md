---
title: Function Catalog
---

### Function Catalog (Observed)

Control
- **Return(val?)** — exit the current skill.
- **StartNotInterruptibleBlock() / StopNotInterruptibleBlock()** — guard critical regions.
- **Sleep(duration, interruptible)** — pause.

Generation
- **Gen(temperature, topP, maxTokens, jsonSchema?, validateSchema?, thinkingBudget?, skipFilter?)**
```guidance
{{Set(name="result", value=Gen(jsonSchema=json.loads(_schemasSkill(defineTasks="True")), validateSchema="True", temperature=0.2, topP=0))}}
```
- **GenStream(interruptMode?, interruptWindow?, temperature, topP, maxTokens, skipFilter?, sendTo?, actorIds?, thinkingBudget?)**
```guidance
{{Set(name="agent_answer", value=GenStream(sendTo="actors", actorIds=last_convo_actor_id, temperature=0.2, maxTokens=4000))}}
```

Events & IO
- **SendSystemEvent(eventIdn, connectorIdn?, global?, ...fields)**
- **SendCommand(commandIdn, integrationIdn, connectorIdn, ...fields)**
- **SendMessage(message, actorIds)**

State (local)
- **Set(name, value)**
- **SetState(name, value) / GetState(name)**

State (persona / user / actors)
- **SetPersonaAttribute(id, field, value) / GetPersonaAttribute(id, field)**
- **GetUser(field?) / UpdateUser(...) / CreatePersona(name)**
- **GetActor(field?) / GetActors(externalId?, integrationIdn?, connectorIdn?) / CreateActor(integrationIdn, connectorIdn, externalId, personaId)**
- **GetAgentPersona(field?)**

Data & JSON
- **Concat(a, b, ...)**, **Stringify(x)**, **AsStringJSON(val)**
- **GetValueJSON(obj, key)**, **UpdateValueJSON(obj, key, value)**
- **AppendItemsArrayJSON(array, items)**, **GetIndexesOfItemsArrayJSON(array, filterPath)**
- **GetItemsArrayByIndexesJSON(array, indexes)**
- **IsEmpty(text)**, **IsSimilar(val1, val2, strategy?, threshold)**
- **GetDatetime(format, timezone)**

Knowledge & AKB
- **SearchFuzzyAkb(query, searchFields?, numberTopics?, fields?, scoreThreshold?, filterByPersonaIds?, labels?)**

Context & triggers
- **GetMemory(count, maxLen, filterByActorIds?, fromDate?, toDate?)**
- **GetTriggeredAct(fields=...)**
- **GetAct(id, fields)**

Examples
```guidance
{{Set(name="payload", value=UpdateValueJSON(obj=payload, key="clientActorId", value=AsStringJSON(val=client_actor_id)))}}
{{SendCommand(commandIdn="send_request", integrationIdn="http", method="POST", url=url, body=payload)}}
```

Notes
- Many helper skills in the repo act like reusable functions: `_utilsSendSystemLogSkill`, `_utilsSetFollowUpTimerSkill`, `_utilsCreatePhoneActorsSkill`, etc.
