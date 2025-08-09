---
title: Agents Catalog
---

### Agents Catalog

Below is a complete catalog of agents, their flows, and skills discovered under `project/`.
Use the collapsible sections to expand each flow.

> Tip: Search in page (Cmd/Ctrl+F) by skill name.

#### ApifyCheckAvailabilityWorker

<details>
<summary><strong>ACAMainFlow</strong> — availability request/receive utilities</summary>

- _hospitalityRequestAvailableSlotsDefaultSchemaSkill.guidance
- _utilsGetConversationChannelSkill.guidance
- _utilsGetCurrentIntegrationIdnSkill.guidance
- _utilsGetFootnoteSkill.guidance
- _utilsGetTimeZoneSkill.guidance
- _utilsSendSystemLogSkill.guidance
- _utilsSetFollowUpTimerSkill.jinja
- HospitalityReceiveAvailableSlotsDefaultSkill.guidance
- HospitalityRequestAvailableSlotsDefaultSkill.guidance
</details>

#### ConvoAgent

<details>
<summary><strong>CAActionCallDefineVoiceMailFlow</strong></summary>

- _defineVoiceMailSkill.guidance
- _getMemorySkill.guidance
- _utilsGetFootnoteSkill.guidance
- AnalyzeConversationSkill.guidance
</details>

<details>
<summary><strong>CAActionCallHangUpFlow</strong></summary>

- _hangUpSkill.guidance
- _schemasSkill.guidance
- _utils_get_current_conversation.jinja
- _utilsGetConversationChannelSkill.guidance
- _utilsGetCurrentIntegrationIdnSkill.guidance
- _utilsGetFootnoteSkill.guidance
- _utilsSendSystemLogSkill.guidance
- _utilsSetFollowUpTimerSkill.jinja
- AnalyzeConversationSkill.guidance
- utils_memory_get_latest_turns.jinja
</details>

<details>
<summary><strong>CAActionCallSendDialpadDigitsFlow</strong></summary>

- _sendDialpadDigitsSchemaSkill.guidance
- _sendDialpadDigitsSkill.guidance
- AnalyzeConversationSkill.guidance
- utils_memory_get_latest_turns.jinja
</details>

<details>
<summary><strong>CAActionCallTransferFlow</strong></summary>

- _getWorkingHoursStatusLLMSkill.guidance
- _getWorkingHoursStatusSkill.guidance
- _schemasSkill.guidance
- _transferCallGetPhoneNumberSkill.guidance
- _transferCallPromiseSkill.guidance
- _transferCallSkill.guidance
- _utilsGetFootnoteSkill.guidance
- _utilsSendSystemLogSkill.guidance
- AnalyzeConversationSkill.guidance
</details>

<details>
<summary><strong>CAActionSendEmailInformationFlow</strong></summary>

- _prepareSentMessagesSkill.guidance
- _sendEmailInformationGetInformationAllowedToBeSentSkill.guidance
- _sendEmailInformationInitialCheckSkill.guidance
- _sendEmailInformationSchemasSkill.guidance
- _sendEmailInformationSkill.guidance
- _utilsCustomerAttributeGetWithDefaultsSkill.guidance
- _utilsGetConversationChannelSkill.guidance
- _utilsGetConversationMetaSkill.guidance
- _utilsGetCurrentIntegrationIdnSkill.guidance
- _utilsGetFootnoteSkill.guidance
- _utilsGetTimeZoneSkill.guidance
- _utilsPersonaAttributeGetWithDefaultsSkill.guidance
- _utilsSendSystemLogSkill.guidance
- _utilsSetFollowUpTimerSkill.jinja
- AnalyzeConversationSkill.guidance
</details>

<details>
<summary><strong>CAActionSendSMSInformationFlow</strong></summary>

- _prepareSentMessagesSkill.guidance
- _selectBookingsToCancelSkill.jinja
- _sendSMSInformationGetInformationAllowedToBeSentSkill.guidance
- _sendSMSInformationInitialCheckSkill.guidance
- _sendSMSInformationSchemasSkill.guidance
- _sendSMSInformationSkill.guidance
- _utilsGetConversationChannelSkill.guidance
- _utilsGetConversationMetaSkill.guidance
- _utilsGetCurrentIntegrationIdnSkill.guidance
- _utilsGetFootnoteSkill.guidance
- _utilsGetTimeZoneSkill.guidance
- _utilsPersonaAttributeGetWithDefaultsSkill.guidance
- _utilsSendSMSWithActorsCreationSkill.guidance
- _utilsSendSystemLogSkill.guidance
- _utilsSetFollowUpTimerSkill.jinja
- AnalyzeConversationSkill.guidance
- HandleSMSSendingErrorSkill.jinja
</details>

<details>
<summary><strong>CABroadcastConversationFlow</strong></summary>

- BroadcastAnalyzeConversation.jinja
- get_memory.jinja
- get_prompt_memory.jinja
- GetConversation.jinja
- utils_get_footnote_actors.jinja
</details>

<details>
<summary><strong>CACalculatorFlow</strong></summary>

- _reasonCleaningPricingSkill.guidance
- CalculateSkill.guidance
</details>

<details>
<summary><strong>CACancellationFlow</strong></summary>

- _cancelBookingInitialCheckSkill.jinja
- _cancelBookingSkill.jinja
- _checkUserBookingsSkill.jinja
- _checkValidBookingsSkill.jinja
- _clearBookingSkill.jinja
- _getBookingIdSkill.jinja
- _schemasSkill.jinja
- AnalyzeConversationSkill.jinja
</details>

<details>
<summary><strong>CACheckingAvailabilityFlow</strong> — slots checking orchestration</summary>

- _convertTimeSkill.guidance
- _notifyUserIssueSkill.guidance
- _receiveAvailabilityProcessFormattedResponseSkill.guidance
- _receiveAvailabilityProcessLLMSkill.guidance
- _receiveAvailableSlotsBuildAvailabilityContextDefaultLLMSkill.guidance
- _receiveAvailableSlotsBuildAvailabilityContextDefaultSkill.guidance
- _receiveAvailableSlotsCheckAvailabilitySkill.guidance
- _receiveAvailableSlotsGetTimeRangeSkill.guidance
- _receiveAvailableSlotsTwoNearestSkill.guidance
- _requestAvailableSlotsInitialCheckSkill.guidance
- _requestAvailableSlotsSkill.guidance
- _restaurantReceiveAvailableSlotsUpdateSeatingOptionsSkill.guidance
- _schemasSkill.guidance
- _utilsFeatureFlagIsActiveSkill.guidance
- _utilsGetConversationChannelSkill.guidance
- _utilsGetConversationMetaSkill.guidance
- _utilsGetCurrentIntegrationIdnSkill.guidance
- _utilsGetFootnoteSkill.guidance
- _utilsGetRandomPostfixSkill.guidance
- _utilsGetTimeZoneSkill.guidance
- _utilsGetWorkingScheduleSkill.guidance
- _utilsGetWorkingStatusLLMSkill.guidance
- _utilsGetWorkingStatusSkill.guidance
- _utilsSendSystemLogSkill.guidance
- _utilsSetFollowUpTimerSkill.jinja
- _validateCheckingAvailabilityAttributesSkill.guidance
- AnalyzeConversationSkill.guidance
- ReceiveAvailableSlotsDefaultErrorSkill.guidance
- ReceiveAvailableSlotsDefaultSkill.guidance
- ReceiveAvailableSlotsSystemSkill.guidance
- ResultSuccessIntercomSkill.guidance
</details>

<details>
<summary><strong>CADataInjectionFlow</strong></summary>

- _buildCustomSectionSkill.guidance
- _defineCalendarSkill.guidance
- _stopReceivingDataSkill.guidance
- _summarizeInjectedData.guidance
- BuildTodaysScheduleSchemaSkill.guidance
- BuildTodaysScheduleSkill.guidance
- CalculateWorkingHoursSkill.guidance
- FetchData.guidance
- InjectCustomSectionSkill.jinja
- PrepareInjectingDataSkill.guidance
- RemoveCustomSectionSkill.jinja
- RetrieveDataSkill.guidance
</details>

<details>
<summary><strong>CAEndSessionFlow</strong></summary>

- Core summarization, disaster handling, working-hours categorization, and timers.
- 40+ skills including `_summarizeConversationSkill`, `_sendEndSessionEventSkill`, `_utilsResetPersonaAttributesSkill`, etc.
</details>

<details>
<summary><strong>CAExecuteExternalTasksFlow</strong></summary>

- Task parsing (`_defineTasksSkill`), email body, SMS/call/meeting execution, session timer, request/response handlers.
</details>

<details>
<summary><strong>CAExternalReply</strong></summary>

- ManyChat/webhook reply construction and senders.
</details>

<details>
<summary><strong>CAGen2*</strong></summary>

- Collect/send user/agent messages, set follow-up timers, turn message helpers.
</details>

<details>
<summary><strong>CAMainFlow</strong> — conversation lifecycle</summary>

- Session start `_startNewSessionSkill`, reply `_userMessageFastReplySkill`, greetings, prompts, outputs, urgent message, switching, and dozens of utils.
</details>

<details>
<summary><strong>CAObserverFlow</strong></summary>

- Conversation quality, extraction of user info, working-hours status.
</details>

<details>
<summary><strong>CARagFlow</strong></summary>

- Prepare RAG context/schema.
</details>

<details>
<summary><strong>CAReportFlow</strong></summary>

- Report building, classification, formatting, sending via email/SMS.
</details>

<details>
<summary><strong>CAScheduleFlow</strong> — booking orchestration</summary>

- Booking steps: initial checks, details gathering, branching (intercom/http/magic_browser), meeting creation, success/error handlers, timers.
</details>

<details>
<summary><strong>CAThinkFlow</strong></summary>

- Service/ZIP checks, double-check patterns.
</details>

<details>
<summary><strong>CAThoughtsFlow</strong></summary>

- Thought generation, prompts, constraints, working-hours status, utilities.
</details>

<details>
<summary><strong>CATimezoneFlow</strong></summary>

- Timezone reasoning.
</details>

#### GeneralManagerAgent

- `GMmainFlow`: Massive setup & migration suite (hundreds of skills) to prepare attributes, business contexts, scenarios, and migrations.

#### MagicWorker

- `MWmainFlow`: Task baking, magic browser automation, retries, alerts, responses.

#### MultiLocationAgent

- `MLAMainFlow`: Location select/switch and analysis.

#### SmsWorker

- `SWmainFlow`: SMS task handling, actor creation, config checks, senders.

#### TaskManager

- `TMManageTasksFlow`: Task definition, scheduling, timers, worker messaging.

#### SuperAgentProject/Metadata

- Project metadata helpers.
