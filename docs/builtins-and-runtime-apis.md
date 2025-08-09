---
title: Built-ins and Runtime APIs
---

### Built-ins and Runtime APIs

Control
- Return(val?)
- StartNotInterruptibleBlock/StopNotInterruptibleBlock
- Sleep(duration, interruptible)

Messaging & IO
- SendMessage(message, actorIds)
- SendSystemEvent(eventIdn, ...)
- SendCommand(commandIdn, integrationIdn, connectorIdn, ...)

Generation
- Gen(...)
- GenStream(...)

State (local)
- Set(name, value)
- SetState(name, value) / GetState(name)

State (persona/actor/user)
- SetPersonaAttribute/GetPersonaAttribute
- GetUser/UpdateUser/CreatePersona
- GetActor/GetActors/CreateActor
- GetAgentPersona

Temporal & context
- GetDatetime(format, timezone)
- GetMemory(count, maxLen, filterByActorIds?, fromDate?, toDate?)
- GetTriggeredAct(fields=...)

Data helpers
- Concat, Stringify, AsStringJSON
- GetValueJSON, UpdateValueJSON, AppendItemsArrayJSON, GetIndexesOfItemsArrayJSON
- IsEmpty, IsSimilar

Tips
- Always gate connector calls by precondition checks.
- Persist important outputs immediately into persona attributes.
- Use `GetTriggeredAct` only inside event/callback handlers.
