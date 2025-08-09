Receive Telephone Calls (Vapi)

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Receive Telephone Calls (Vapi)

Search

All

Pages

###### Start typing to search…

# Receive Telephone Calls (Vapi)

Although Twilio does a great job at providing voice call services, Vapi integration allows for a more realistic voice call. Vapi integration supports both incoming and outgoing phone calls. In other words, you can use this integration to call your agent, or an agent can use it to call you.

**Goal:** Integrate Vapi and allow for calling a digital employee agent.

If you don't want to create a new agent, use your existing agent from the Embedded Instructions tutorial and simply create a new Flow. Alternatively, let's start fresh and create a new agent. Follow the steps outlined in the "Hello World," which are:

*   Create an Agent
*   Create a Sandbox Connector
*   Create a Flow
*   Add a User
*   Create a Skill
*   Add Code to the Skill Script (Copy the Skill Script from the [Embedded Instructions](embedded-instructions.md) tutorial)

### 

Vapi Integration

[](#vapi-integration)

For details on creating a Vapi connector, go [here](vapi-integration.md).

### 

Create an Event (Vapi Integration)

[](#create-an-event-vapi-integration)

To enable your Agent to answer incoming phone calls you need to subscribe this Agent's flow to the “user\_message” event triggered by the Vapi connector you just created.

1.  Navigate to your agent's Flow. The agent should be the same one you selected when setting up the Vapi connector.
2.  Click the **plus** icon next to the Event Subscription section on the left-side panel.
3.  Under the “Event Idn,” select “user\_message” from the dropdown.
4.  Under “Integration,” select “vapi” from the dropdown.
5.  Under “Connector,” select “vapi\_\[phone number\]” from the dropdown.
6.  Under “Skill selector,” select “skill\_idn” from the dropdown. You are telling your flow that when a user calls the generated phone number, select a specific Skill to activate.
7.  In this case, you want to activate the Skill your agent will use when on the phone. Select it from the “Skill name” dropdown.
8.  Add an “Event description.” This field is optional but will help in the future when identifying the purpose of an event from a complex flow containing multiple event subscriptions.
9.  Click **Create** to save the event.

### 

Test Functionality

[](#test-functionality)

1.  Click **Save and Publish** in the top-right corner of the Flow Builder.
2.  Call the number you selected when setting up the Vapi connector. You can also see this number by looking at the event you just created (i.e., vapi\_\[phone number\]). Your digital employee should answer the phone. Have fun asking your agent questions and hearing the responses.

Updated 4 months ago

* * *
