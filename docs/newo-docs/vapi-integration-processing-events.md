Vapi Integration (Processing Events)

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Vapi Integration (Processing Events)

Search

All

Pages

###### Start typing to search…

# Vapi Integration (Processing Events)

The Vapi integration supports two events:

*   **call\_ended:** This event is triggered whenever a user or an Agent hangs up the phone.
*   **call\_aborted:** This event is triggered whenever a phone call cannot be started or is finished unexpectedly.

You can subscribe to these events to allow your Agent to process these situations according to its flow.

1.  Navigate to your agent's Flow.
2.  Click the **plus** icon next to the Event Subscription section on the left-side panel.
3.  Under the "Event Idn," select "call\_ended" or "call\_aborted" from the dropdown.
4.  Under "Integration," select "vapi" from the dropdown.
5.  Under "Connector," select “vapi\_\[phone number\]” from the dropdown or whatever you named your Vapi connector.
6.  Under "Skill selector," select "skill\_idn" from the dropdown. You are telling your flow to select a specific skill to activate when the event is triggered.
7.  In this case, you want to activate the skill your agent will use when the call is ended or aborted. Select it from the "Skill name" dropdown.
8.  Add an "Event description." This field is optional but will help in the future when identifying the purpose of an event from a complex flow containing multiple event subscriptions.
9.  Click **Create** to save the event.

Updated 4 months ago

* * *
