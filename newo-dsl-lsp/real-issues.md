# Real Issues Found in Production Templates

Scan date: 2026-02-20
Templates scanned: 2,108 (V1 `.jinja`/`.guidance` + V1 `.guidance`/`.jinja` in `project/`)
Validator version: post-V4c (Fixes 1-11, with full skill index)
Skill index: 1,301 skills indexed (492 with parameter definitions)

## Improvement Summary

| Metric | Round 1 (empty index) | Round 2 (post-V4b) | Round 3 (skill index) |
|--------|----------------------|--------------------|-----------------------|
| Templates scanned | 1,208 | 1,208 | 2,108 |
| Total E+W | ~4,067 | 3,447 | **1,264** |
| Errors | 1,616 | 1,616 | **48** |
| Warnings | 1,831 | 1,831 | **1,216** |
| Hints | 151 | 151 | **2,927** |
| Unknown function errors | 1,599 | 1,599 | **22** |
| FP rate (est.) | ~61% | ~58% | **~14%** |

## Real Issues Summary

| Category | Count | Severity | Action Needed |
|----------|-------|----------|---------------|
| Dead store (SetState overwrite) | 40 | Warning | Review intent |
| Missing skill parameters | 80+ | Warning | Fix callers or update metadata |
| Missing required action parameter | 15 | Warning | Fix or update schema |
| Unknown function (casing/rename) | 22 | Error | Fix function name |
| Brace balance issues | 13 | Error | Investigate |
| Stray triple braces `}}}` | 4 | Error | Remove extra brace |
| Unknown parameter for skill | 8 | Error | Fix param name |
| String iteration risk | 7 | Warning | Verify variable type |
| Naming convention mismatch | 28+ patterns | Warning | Review - may be skill params |
| Unreachable code | 1 | Warning | Investigate |
| Unclosed string literal | 1 | Error | Fix quoting |
| Tab in arguments | 1 | Warning | Replace with spaces |
| Duplicate parameter | 3 | Warning | Remove duplicate |

---

## 1. Dead Store - SetState Overwrite (40 issues)

A `SetState()` call writes a value that is immediately overwritten by another `SetState()` to the same key, meaning the first write has no effect.

### V1 Templates (newo_customers/)

| File | Line | Key | Overwritten On |
|------|------|-----|----------------|
| `ConvoAgent/CAFollowUpFlow/DisableFollowUp/DisableFollowUp.jinja` | 9 | `follow_up_state` | Line 12 |
| `ConvoAgent/CAFollowUpFlow/FollowUpMessageSkill/FollowUpMessageSkill.jinja` | 14 | `followup_counter` | Line 26 |
| `ConvoAgent/CAFollowUpFlow/FollowUpMessageSkill/FollowUpMessageSkill.jinja` | 26 | `followup_counter` | Line 59 |
| `ConvoAgent/CAFollowUpFlow/SetFollowupSkill/SetFollowupSkill.jinja` | 12 | `event_block` | Line 23 |
| `ConvoAgent/CAMainFlow/SwitchConversationStartedSkill/...guidance` | 4 | `conversation_started_newo_voice_skill` | Line 8 |
| `ConvoAgent/CAMainFlow/user_message_fast_reply_post_actions/...guidance` | 15 | `corrected_memory` | Line 23 |
| `ConvoAgent/CAScheduleFlow/__bookRestaurantDefaultRetrySkill/...jinja` | 7 | `retry_count` | Line 43 |
| `ConvoAgent/CAThoughtsFlow/_getCachedThoughtsPromptSkill/...jinja` | 4 | `last_no_task_prompt` | Line 9 |
| `GeneralManagerAgent/GMPrepareITMFlow/prepare_itm/prepare_itm.jinja` | 7 | `itm_cached` | Line 101 |
| `GeneralManagerAgent/GMPrepareReportsFlow/prepare_report_content_json/...jinja` | 17 | `report_content_previous` | Line 23 |
| `GeneralManagerAgent/GMmainFlow/_prepareAttributesCommonDefaultBusinessTimeZoneSkill/...guidance` | 7 | `previous_time_zone` | Line 54 |
| `GeneralManagerAgent/GMmainFlow/_prepareAttributesRestaurantPrivateDynamic.../...guidance` | 7, 85, 91 | `previous_restaurant_googlemaps_reservation_url` | Lines 85, 91, 114 |
| `GeneralManagerAgent/GMmainFlow/rag_append_from_text/...jinja` | 14 | `previous_rag_knowledge_base_append_text` | Line 26 |
| `GeneralManagerAgent/GMmainFlow/rag_append_from_websites/...jinja` | 16 | `previous_rag_knowledge_base_append_websites` | Line 20 |
| `MagicWorker/MWmainFlow/_findMissedFieldsSkill/...guidance` | 26 | `task_idn` | Line 52 |
| `MagicWorker/MWmainFlow/_validateRetryCountSkill/...jinja` | 4 | `attempt_number` | Line 8 |

### project/ Templates (additional)

| File | Line | Key | Overwritten On |
|------|------|-----|----------------|
| `ConvoAgent/CAMainFlow/SwitchConversationStartedSkill.guidance` | 4 | `conversation_started_newo_voice_skill` | Line 8 |
| `ConvoAgent/CAMainFlow/SwitchReplyOutboundSkill.guidance` | 4 | `conversation_started_newo_voice_skill` | Line 8 |
| `ConvoAgent/CAMainFlow/_userMessageFastReplySkill.guidance` | 49 | `corrected_memory` | Line 56 |
| `GeneralManagerAgent/GMmainFlow/_prepareAttributesCommonDefaultBusinessTimeZoneSkill.guidance` | 7 | `previous_time_zone` | Line 54 |
| `GeneralManagerAgent/GMmainFlow/_prepareAttributesCommonDefaultSendReportContentSkill.guidance` | 15, 37, 43, 49, 55, 61, 67, 73, 79 | `previous_send_report_content` | Cascading overwrites |
| `GeneralManagerAgent/GMmainFlow/_prepareAttributesRestaurantPrivateDynamic...guidance` | 7, 85, 91 | `previous_restaurant_googlemaps_reservation_url` | Lines 85, 91, 114 |
| `GeneralManagerAgent/GMmainFlow/_utilsBuildIntentTypeMapSkill.guidance` | 16, 22 | `previous_intent_type_map` | Lines 22, 90 |
| `MagicWorker/MWmainFlow/_findMissedFieldsSkill.guidance` | 26 | `task_idn` | Line 52 |
| `MagicWorker/MWmainFlow/_validateRetryCountSkill.guidance` | 10, 19, 25 | `attempt_number` | Lines 19, 25, 30 |

**Note**: Most are intentional "initialize then update" patterns. The `_prepareAttributesCommonDefaultSendReportContentSkill.guidance` has 9 cascading overwrites which may be the most worth reviewing.

---

## 2. Unknown Functions (22 occurrences, 6 unique)

These functions are NOT in the skill index and NOT a known built-in action:

| Function | Count | Files | Analysis |
|----------|-------|-------|----------|
| `Menu` | 8 | `_migration_2_5_96` (x4 V1, x4 project) | Deprecated - renamed to `Gen` |
| `ZoneInfo` | 5 | Various GM migration files | Python built-in, not a Newo action |
| `MWtaskBakerSkill` | 4 | MagicWorker | Missing from codebase - deleted? |
| `set` | 2 | `ExecuteTasksSkill` (V1 + project) | Casing error - should be `Set` |
| `CopyAndBuildAkb` | 2 | GM migration files | Missing from codebase - deleted? |
| `_utilsBuildIntentTypeMapStoreIntentsSkill` | 1 | project/ only | Missing from codebase |

**Note**: `get_memory` (from previous report) resolved with skill index. `Menu`, `set` are confirmed casing/rename errors. `ZoneInfo` is a Python import not applicable in this context.

---

## 3. Missing Skill Parameters (80+ issues)

With the skill index, the validator now knows which parameters each skill expects. These callers are missing required parameters:

### `set_customer_attribute_from_ac_if_first_init_and_empty` missing `default` (39 occurrences)

8 files call this skill without the `default` parameter. Most common pattern:
```jinja
{{set_customer_attribute_from_ac_if_first_init_and_empty(name="attribute_name", user_id=user_id)}}
```

### `v2v_add_context` - wrong parameter name (6 Errors + 6 Warnings)

6 files pass `user_id` instead of `actor_id`:
```jinja
{{v2v_add_context(turn=instruction, user_id=user_id)}}
```
Expected: `actor_id`, `turn`. The `user_id` param is unknown to this skill.

### `utils_get_footnote_actor_id` missing params (10 occurrences)

5 files missing `debug`, `thoughts`, or `system` parameters.

### `v2v_update_current_prompt` missing params (10 occurrences)

5 files missing `inject_thoughts`, `user_id`, or `footer_instruction`.

### `utils_structured_generation` missing params (8 occurrences)

3 files missing `thinking_budget`, `top_p`, or `temperature`.

### Built-in action missing required params (15 occurrences)

| Action | Missing Param | Count | Files |
|--------|--------------|-------|-------|
| `Do` | `action` | 7 | `AnalyzeConversation.jinja`, `handle_after_action.jinja`, `apply_migrations.jinja` |
| `CreateWebhook` | `webhookIdn` | 5 | `prepare_connectors_api_integration.jinja` |
| `DeleteWebhook` | `webhookIdn` | 3 | `_migration_2_6_0_connectors.jinja` |

### `structured_generation` - unknown parameter (2 Errors)

2 files pass `thinking_budget` which is not in the skill's parameter list:
```jinja
{% set result = structured_generation(prompt=prompt, schema=schema, thinking_budget=1120) %}
```

---

## 4. Brace Balance Issues (13 errors)

Files with unmatched `{{`/`}}` expression braces:

| File | Issue |
|------|-------|
| `ConvoAgent/CAActionCallTransferFlow/_transferCallGetPhoneNumberSkill/...guidance:1` | 22 `{{` vs 23 `}}` |
| `ConvoAgent/CAMainFlow/_startNewSessionSkill/_startNewSessionSkill.guidance:1` | 20 `{{` vs 19 `}}` |
| `ConvoAgent/CAScheduleFlow/_bookSkill/_bookSkill.guidance:1` | 172 `{{` vs 173 `}}` |
| `ConvoAgent/CAScheduleFlow/get_mock_data/get_mock_data.jinja:33` | 7 `{{` vs 8 `}}` (FP - JSON in capture block) |
| `GeneralManagerAgent/GMmainFlow/_setupAccountSkill/_setupAccountSkill.guidance:1` | 42 `{{` vs 41 `}}` |
| `project/ConvoAgent/CAEndSessionFlow/_summarizeMemoriesSkill.guidance:1` | 6 `{{` vs 7 `}}` |
| `project/ConvoAgent/CAMainFlow/_getMainInstructionSkill.guidance:1` | 9 `{{` vs 8 `}}` |
| `project/ConvoAgent/CAMainFlow/_startNewSessionSkill.guidance:1` | 15 `{{` vs 14 `}}` |
| `project/ConvoAgent/CAObserverFlow/DefineUserPhoneNumberSkill.guidance:1` | 14 `{{` vs 15 `}}` |
| `project/ConvoAgent/CAObserverFlow/_extractUserInformationDuringConversationSkill.guidance:1` | 42 `{{` vs 41 `}}` |
| `project/ConvoAgent/CAScheduleFlow/_bookSkill.guidance:1` | 134 `{{` vs 135 `}}` |
| `project/ConvoAgent/CAThoughtsFlow/_getMainInstructionSkill.guidance:1` | 9 `{{` vs 8 `}}` |
| `project/GeneralManagerAgent/GMmainFlow/...WorkScheduleObjectTestSkill.guidance:47` | 33 `{{` vs 37 `}}` |

**Note**: The `get_mock_data.jinja` issue is a known FP from JSON data inside a `{% set %}...{% endset %}` capture block. All others are in Guidance files and likely have real off-by-one brace errors.

---

## 5. Stray Triple Braces (4 errors)

Files with `}}}` - an extra `}` attached to a closing `}}`:

| File | Line | Context |
|------|------|---------|
| `ConvoAgent/CANewoToolCaller/AnalyzeConversation/AnalyzeConversation.jinja` | 25 | `{tool_name: tool_content}}})}}` - dict inside expression |
| `ConvoAgent/CANewoToolCaller/AnalyzeConversation/AnalyzeConversation.jinja` | 38 | `{key: {"tools": {}}})}}` - dict inside expression |
| `GeneralManagerAgent/GMmainFlow/_prepareAttributesBookingSchemasSkill/...jinja` | 39 | `}}}` in JSON string |
| `project/GeneralManagerAgent/GMmainFlow/_prepareAttributesBookingSchemasSkill.guidance` | 21 | `}}}` in JSON string |

**Note**: The `AnalyzeConversation.jinja` cases are from dict literals inside `{{ }}` expressions. The others are from JSON strings with `}}}` at the end.

---

## 6. Naming Convention Mismatches (58 typo suggestions)

Variables flagged as undefined with a close match. Two categories:

### Likely real - camelCase skill parameters (30 occurrences)

| Variable Used | Suggested Match | Count | Context |
|---------------|-----------------|-------|---------|
| `taskObject` | `task_object` | 14 | MagicWorker/SmsWorker files |
| `bookingDetails` | `booking_details` | 6 | `__bookRestaurantSkill.guidance` |
| `fixed_header` | `fixed_headers` | 6 | `_migration_2_5_118_itm.jinja` |
| `intentType` | `intent_type` | 1 | `_sendReportDefineDirectionsFallback...jinja` |
| `userId` | `user_id` | 1 | `_sendEmailInformation...guidance` |
| `availabilitySchema` | `availability_schema` | 1 | Various |
| `conversationTypes` | `conversation_types` | 1 | Various |

### False positives - natural language words in Guidance comments (28 occurrences)

| Word | Suggested | Count | Context |
|------|-----------|-------|---------|
| `ami` | `acc` | 13 | French word in `_prepareAkbCommonProceduresSkill.guidance` - actually a real skill param |
| `new` | `key` | 2 | Inside Guidance comment `{{! ... }}` |
| `we` | `key` | 2 | Inside Guidance comment `{{! ... }}` |
| `all` | `asr` | 1 | Natural language word |
| `taskID` | `taskId` | 1 | Casing mismatch |
| `bookingId` | `bookings` | 1 | Unrelated names |
| `taskId` | `tasks` | 2 | Unrelated names |
| Others | Various | 6 | Mixed |

**Note**: The `ami` cases are real skill parameters (not typos for `acc`). The `new`, `we` cases are from Guidance comment blocks `{{! ... }}` being parsed as expressions.

---

## 7. String Iteration Risk (7 warnings)

Unchanged from previous report - variables typed as `string` being iterated:

| File | Line | Variable | Source |
|------|------|----------|--------|
| `ConvoAgent/CAMainFlow/prepare_rag_context/...jinja` | 20 | `rag_context_topics` | Concatenation |
| `ConvoAgent/CARagFlow/PrepareRagContext/...jinja` | 21 | `rag_context_topics` | Concatenation |
| `GeneralManagerAgent/GMPrepareITMFlow/utils_compile_customer_attribute/...jinja` | 7 | `attributes` | Concatenation |
| `GeneralManagerAgent/GMcanvasBuilderFlow/utils_compile_customer_attribute/...jinja` | 7 | `attributes` | Concatenation |
| `GeneralManagerAgent/GMmainFlow/_migration_3_0_3_blocked_phones_clean/...jinja` | 6 | `blocked_phone_numbers` | Concatenation |
| `GeneralManagerAgent/GMmainFlow/rag_append_create_akb_topics/...jinja` | 172 | `labels_raw` | Concatenation |
| `GeneralManagerAgent/GMmainFlow/utils_compile_customer_attribute/...jinja` | 7 | `attributes` | Concatenation |

---

## 8. Other Issues

### Unclosed String Literal (1 error)
- `ConvoAgent/CAAssessmentFlow/collect_quality_metrics_agent_behavior/...jinja:61`
- Function `problem` has an unclosed string in its arguments

### Tab Character in Arguments (1 warning)
- `ConvoAgent/CAMainFlow/_generateGreetingPhrasesSkill/...guidance:67`
- `Set()` call contains a tab character

### Unreachable Code (1 warning)
- `project/ConvoAgent/CACancellationFlow/_cancelBookingInitialCheckSkill.jinja:33`
- Code after `Return()` on line 31 that will never execute

### Duplicate Parameter (3 warnings)
- `_utilsAkbTopicCreateSkill`: duplicate parameter `labels` (2 occurrences)
- `SetPersonaAttribute`: duplicate parameter `id` (1 occurrence)

---

## Remaining False Positives (~178 estimated)

| Category | Est. Count | Source |
|----------|-----------|--------|
| Natural language words in Guidance templates | ~100 | Words like `the`, `we`, `a`, `to`, `new` parsed as variable refs from Guidance text |
| False typo suggestions (short word -> unrelated var) | ~28 | e.g., `ami -> acc`, `new -> key` |
| JSON in `{% set %}...{% endset %}` capture blocks | ~1 | `get_mock_data.jinja` brace FP |
| Undefined variable (real skill params without metadata) | ~50 | Skills without metadata.yaml params |

**Total FP rate: ~14%** (178 out of 1,264 E+W diagnostics)

---

## Known Remaining LSP Limitation: Guidance Comment Parsing

The parser extracts words from Guidance comment blocks `{{! text }}` as variable references. This causes false "undefined variable" warnings for common English words. A future fix would need to skip extraction from Guidance comment content.

---

## Excluded from Report

- **993 "Undefined variable" warnings (no suggestion, Jinja files)**: These are skill parameters injected at runtime (e.g., `description`, `body`, `prompt`, `user_id`). Without comprehensive metadata parsing, the validator cannot resolve them.

- **2,927 Hints**: Informational diagnostics (variable used before definition, possibly a skill parameter, unused variables). Intentionally low-severity.
