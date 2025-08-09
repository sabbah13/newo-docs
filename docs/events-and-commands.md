---
title: Events and Commands
---

### Events and Commands

System Events (internal bus)
- Emitted via `SendSystemEvent(eventIdn=..., ...)`.
- Common eventIdn observed: `session_started`, `extend_session`, `analyze_conversation`, `prepare_rag_context_command`, `prepare_injecting_data`, `urgent_message`, `book_slot`, `end_session`, `worker_message`, `task_manager_*`, `project_metadata`, and booking-related fallbacks.
- Use cases: fan-out orchestration, state updates, RAG prep, timers callbacks.

External Commands (connectors)
- Emitted via `SendCommand(commandIdn=..., integrationIdn=..., connectorIdn=..., ...)`.
- Observed commandIdn/integrationIdn pairs:
  - `set_timer` → `program_timer/*`
  - `send_message` → `twilio_messenger/sms_connector`
  - `update_session`, `set_turn_message`, `session_started` → `newo_voice/newo_voice_connector`
  - `create_event` → `google_calendar/calendar`
  - `send_request` (HTTP POST/GET) → `http/http_connector`
  - `get_or_create_actor`, `send_actor_event` → `customer_intercom/connection`
  - `book_restaurant_slot`, `magic_browser_command` → `magic_browser/magic_browser_connector`
  - `send_email`, `onboarding_setup`, `send_slack_report` → `api/webhook`
  - `add_phone_to_pool` → `twilio_messenger/sms_connector`

Patterns
- Commands trigger side effects and may produce callbacks (events/webhooks) handled by dedicated skills (e.g., booking result handlers).
- System events decouple producers and consumers across flows/agents.

Examples
- Session start: emit `session_started` (system) and `session_started` (webhook).
- Booking: branch by config and emit `book_slot` or call HTTP/Intercom/MagicBrowser, then handle result events with user feedback via `urgent_message`.
