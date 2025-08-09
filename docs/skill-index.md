---
title: Skill Index
---

### Skill Index (Structure)

- ConvoAgent/
  - CAMainFlow/: session lifecycle, turn handling, greetings, urgent messages, utils.
  - CAScheduleFlow/: booking orchestration (restaurant, intercom, http), timers, success/error handlers.
  - CAExecuteExternalTasksFlow/: parses tasks, sends SMS/email/calls/meetings, session timer.
  - CAEndSessionFlow/: summarization, disaster reporting, end-session handling.
  - CAObserverFlow/: conversation quality, user info extraction, working hours.
  - CAThoughtsFlow/: agent thoughts, directives, cached prompts.
  - CAAction*/: call transfer, voicemail, DTMF, info senders (email/SMS).
  - CARagFlow/: RAG context.
  - CAReportFlow/: reporting to channels (email/SMS), semaphore analyses.
  - CAGen2*/: message send/collect for gen2 pipeline; follow-up timers.
  - CAExternalReply/: ManyChat/webhook replies.

- GeneralManagerAgent/GMmainFlow/: onboarding, connector setup, migrations, attributes preparation.

- TaskManager/TMManageTasksFlow/: task schema/definition, scheduling, timers, worker messaging.

- MagicWorker/MWmainFlow/: task baking, browser automation, alerts, retries, responses.

- SmsWorker/SWmainFlow/: SMS task baking, config validation, actor management, messaging.

- ApifyCheckAvailabilityWorker/ACAMainFlow/: request/receive availability for hospitality.

- MultiLocationAgent/MLAMainFlow/: location-related skills.

See `flows.yaml` for authoritative mapping between flow IDs and script paths.
