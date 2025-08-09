---
title: Agents and Flows
---

### Agents and Flows

A practical map of the system: who does what, and how they talk to each other.

```mermaid
flowchart TD
  U[User] --> CAMF[ConvoAgent: CAMainFlow]
  CAMF -->|analyze_conversation| CAObs[CAObserverFlow]
  CAMF -->|prepare_rag_context_command| CARag[CARagFlow]
  CAMF -->|calls| CASched[CAScheduleFlow]
  CAMF -->|set_timer| Timer
  CAMF -->|urgent_message| Voice[NEWO Voice]
  CARag -->|persona_rag| CAMF
  CASched -->|create_event| GCal[Google Calendar]
  CASched -->|send_request| HTTP[HTTP]
  CASched -->|send_actor_event| Intercom[Intercom]
  CASched -->|book_restaurant_slot| MB[Magic Browser]
  Timer --> CAMF
  TM[TaskManager] -->|task_manager_execute_task| MW[MagicWorker]
  MW -->|magic_browser_command| MB
  Tool[Tool Caller] -->|get_tools_to_call_schema| CAMF
```

#### ConvoAgent
- `CAMainFlow` — conversation lifecycle (start, reply, timers, RAG hooks)
- `CAScheduleFlow` — booking orchestration (intercom/http/magic browser)
- `CAExecuteExternalTasksFlow` — SMS/email/calls/meetings via schemas
- `CAObserverFlow` — ongoing quality evaluation and actions
- `CAEndSessionFlow` — end-session report and webhooks
- `CARagFlow` — RAG topic selection and persona enrichment
- `CAAction*` — telephony actions (transfer, DTMF, voicemail)

#### GeneralManagerAgent
- `GMmainFlow` — onboarding, attributes, migrations, and scenarios

#### TaskManager
- `TMManageTasksFlow` — classify, schedule (interval/fireAt), message workers

#### MagicWorker
- `MWmainFlow` — bake/validate tasks, magic browser automation

#### SmsWorker
- `SWmainFlow` — SMS validation, actor creation, sending

#### ApifyCheckAvailabilityWorker
- `ACAMainFlow` — utilities for availability request/receive
