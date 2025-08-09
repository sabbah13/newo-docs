Make Telephone Calls (Vapi)

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Make Telephone Calls (Vapi)

Search

All

Pages

###### Start typing to search…

# Make Telephone Calls (Vapi)

For this use case, the agent needs to be given the ability to make calls to a user, which involves adding a new call Skill.

**Goal:** Integrate Vapi and allow an agent to call a user.

Let's use the same agent and flow from the [previous example](https://docs.newo.ai/docs/receive-telephone-calls-twilio-copy). A new Skill and event need to be created. Delete all existing events from the previous example, as we will be using different event connectors.

### 

Vapi Integration

[](#vapi-integration)

For details on creating a Vapi connector, go [here](https://docs.newo.ai/docs/vapi-integration).

### 

Calling Skill

[](#calling-skill)

Create a new Skill (Skill Idn = "MakeCallSkill") and copy the following into the Skill Script:

```
{{SendCommand(
    commandIdn="make_call", 
    integrationIdn="vapi", 
    connectorIdn="vapi_[phone number]",
    phoneNumber="+12345678912"
)}}
```

Replace the “connectorIdn” with the Idn of the Vapi connector you just created. Replace the phone number with the number you want your agent to call.

### 

Sandbox Event

[](#sandbox-event)

Create a new Sandbox event as follows:

1.  Click the **plus** icon next to the Event Subscription section on the left-side panel.
2.  Under the “Event Idn,” select “user\_message” from the dropdown.
3.  Under “Integration,” select “sandbox” from the dropdown.
4.  Under “Connector,” select “connector” from the dropdown. This is the connector created under the Sandbox Integration.
5.  Under “Skill selector,” select “skill\_idn” from the dropdown. You are telling your flow that when a user sends a message from the Sandbox chat, select a specific Skill to activate.
6.  In this case, you want to activate the newly created Skill, "MakeCallSkill". Select it from the “Skill name” dropdown.
7.  Add an “Event description.” This field is optional but will help in the future when identifying the purpose of an event from a complex flow containing multiple event subscriptions.
8.  Click **Create** to save the event.

### 

Create an Event (Vapi Integration)

[](#create-an-event-vapi-integration)

Create a new Twilio event as follows:

1.  Click the **plus** icon next to the Event Subscription section on the left-side panel.
2.  Under the “Event Idn,” select “user\_message” from the dropdown.
3.  Under “Integration,” select “vapi” from the dropdown.
4.  Under “Connector,” select “vapi\_\[phone number\]” from the dropdown.
5.  Under “Skill selector,” select “skill\_idn” from the dropdown. You are telling your flow that when a user sends a message from the Sandbox chat, select a specific Skill to activate.
6.  In this case, you want to activate your "MakeCallSkill." Select it from the “Skill name” dropdown.
7.  Add an “Event description.” This field is optional but will help in the future when identifying the purpose of an event from a complex flow containing multiple event subscriptions.
8.  Click **Create** to save the event.

### 

Test Functionality

[](#test-functionality)

When a user sends a message in the Sandbox chat, the Sandbox event will trigger and activate the "MakeCallSkill." The "MakeCallSkill" will trigger the Vapi event and activate the main Skill, which allows the agent to use that Skill for the telephonic conversation with a user.

1.  Click **Save and Publish** in the top-right corner of the Flow Builder.
2.  Type any message in the Sandbox chat and your agent will call your number and have a conversation with you. Have fun asking your agent questions and hearing the responses.

Updated 4 months ago

* * *
