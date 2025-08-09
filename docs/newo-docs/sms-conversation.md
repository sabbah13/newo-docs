Twilio SMS Notifications

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Twilio SMS Notifications

Search

All

Pages

###### Start typing to search…

# Twilio SMS Notifications

Text messages to a user's phone can ensure they're reminded of upcoming events (i.e., notifications) or sent information, such as booking details.

**Goal:** Add a Twilio messaging integration to allow for SMS notifications.

> 📘
> 
> ### 
> 
> Video tutorial coming soon!
> 
> [](#video-tutorial-coming-soon)

### 

Create a Twilio Messenger Connector

[](#create-a-twilio-messenger-connector)

1.  To create a new Twilio Messenger connector, navigate to the Integrations page from the left-side panel.
2.  Click the **gear** icon on the "Twilio Messenger" item.
3.  Add your "Twilio Account SID" and "Twilio Auth Token" and click **Save**.
4.  Click the **plus** icon on the “Twilio Messenger” item.
5.  Add a “Title” and “Idn.” In this case, just call them both “sms\_connector.”
6.  Select an "Agent Phone Number" from the populated list. If you don't select a number, one will be assigned automatically.
7.  Click **Save**.

### 

Create a New Skill

[](#create-a-new-skill)

Start by creating a new agent and flow. Add a Skill with a "Skill Idn" of "SmsSkill." Copy the following Skill Script into your newly created Skill:

```
{{SendCommand(
    commandIdn="send_message", 
    integrationIdn="twilio_messenger", 
    connectorIdn="sms_connector",
    text="This is a notification!!!",
    phoneNumber="+1234567890"
)}}
```

The "commandIdn" and "integrationIdn" strings are set names to initiate the Twilio message functionality. The "connectorIdn" is the one you just set up. Add any string to the "text" value and add your phone number (with country code) to the "phoneNumber" value.

### 

Create New Event

[](#create-new-event)

In order for the newly created "SmsSkill" to be activated, the Skill needs to be subscribed to an event, which will be triggered when sending a message in the Sandbox chat.

1.  Click the **plus** icon next to the Event Subscription section on the left-side panel.
2.  Under the “Event Idn,” select "user\_message" from the dropdown.
3.  Under “Integration,” select “twilio\_messenger” from the dropdown.
4.  Under “Connector,” select “sms\_connector” from the dropdown.
5.  Under “Skill selector,” select “skill\_idn” from the dropdown.
6.  Under “Skill name,” select “SmsSkill” from the dropdown.
7.  Add an “Event description.” This field is optional but will help in the future when identifying the purpose of an event from a complex flow containing multiple event subscriptions.
8.  Click **Create** to save the event.

### 

Add a User

[](#add-a-user)

1.  Click the **Sandbox Chat** button at the top-right corner of the Flow Builder to open the Sandbox chat panel. Ensure the correct agent is selected from the dropdown within the panel.
2.  Click the **plus** icon next to the “User:” section in the Sandbox chat.
3.  Add a “Name.” In this case, this is the name of a user who will be talking to the agent, which can be your name or a made-up name for testing purposes.
4.  Click the checkbox if you'd like to create an actor for the user persona. An Actor is someone who communicates through a specific connector. For example, a specific user could communicate via the Sandbox chat (Sandbox chat connector) and over the phone (Twilio connector), which each have identifiers of separate actors. For this case, we are going to create a single actor for Twilio SMS communications (ensure the checkbox is ticked).
5.  Under the "Actor settings," select “twilio\_messenger” for the “Integration” and “sms\_connector” for the “Connector.”
6.  Click **Create and apply** to save the user.

### 

Test Functionality

[](#test-functionality)

1.  Click **Save and Publish** in the top-right corner of the Flow Builder.
2.  Type anything in the Sandbox chat field, and click the **send** icon. You should receive an SMS to the number added in the SendCommand action.

> 🚧
> 
> ### 
> 
> If sending SMS notifications to a US number (+1), ensure your Twilio account is US A2P 10DLC registered. More information [here](https://www.twilio.com/docs/messaging/compliance/a2p-10dlc).
> 
> [](#if-sending-sms-notifications-to-a-us-number-1-ensure-your-twilio-account-is-us-a2p-10dlc-registered-more-information-here)

Updated 4 months ago

* * *
