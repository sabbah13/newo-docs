---
title: Connectors
---

### Connectors

Observed connectors
- newo_voice/newo_voice_connector: voice session control and call transfer.
- twilio_messenger/sms_connector: SMS send/receive, phone pool management.
- google_calendar/calendar: meeting creation (`create_event`).
- http/http_connector: arbitrary HTTP requests (`send_request`).
- customer_intercom/connection: CRM actor mapping and events.
- magic_browser/magic_browser_connector: browser automation (restaurant booking).
- program_timer/*: scheduled callbacks via `set_timer` (`interval` or `fireAt`).
- api/webhook: generic outbound actions (emails, onboarding, reports).
- manychat (via HTTP API): external reply delivery.

Timers: interval vs absolute time
```guidance
{{SendCommand(commandIdn="set_timer", integrationIdn="program_timer", personaId=user_id, timerName="session_timer", interval="300", eventIdn="end_session")}}
{{SendCommand(commandIdn="set_timer", integrationIdn="program_timer", connectorIdn="session_timer", fireAt=execution_time, timerName=Concat("task_manager_scheduled_task_", task_id), eventIdn="task_manager_trigger_task", personaId=user_id)}}
```

ManyChat external replies
```guidance
{{SendCommand(
  commandIdn="send_request", integrationIdn="http", connectorIdn="http_connector", method="POST",
  url="https://api.manychat.com/fb/sending/sendContent",
  headers=_getManyChatReplyRequestHeadersSkill(),
  body=_getManyChatReplyRequestBodySkill(externalId=externalId, message=message, channel=GetPersonaAttribute(id=userId, field="external_channel"))
)}}
```

Voice call transfer
```guidance
{{SendCommand(commandIdn="transfer_call", integrationIdn="newo_voice", connectorIdn="newo_voice_connector", phoneNumber=transfer_call_phone_number, waitForTransferSeconds=transfer_call_timeout)}}
```

General command fields
- `userPersonaId`, `actorId`, `toActorId`, `eventIdn`, `eventArguments`, `method`, `headers`, `url`, `body`, `targetAction`, `timerName`, `interval`.

Callbacks
- Connectors may post back as triggers (webhooks or system dispatch). Use `GetTriggeredAct(fields=...)` to parse arguments in the receiving skill.
