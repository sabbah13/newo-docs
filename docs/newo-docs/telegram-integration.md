Telegram Integration

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Telegram Integration

Search

All

Pages

###### Start typing to search…

# Telegram Integration

Telegram integration allows a user to have a conversation with an agent via a Telegram Messenger Bot. This integration can easily be added to existing agents.

### 

Create a Telegram Bot

[](#create-a-telegram-bot)

1.  Within Telegram (Mobile, Desktop, or Web), click the search field and search for "BotFather."
2.  Click "BotFather" and click **Start**.
3.  Send the message "/newbot."
4.  Give your bot a name (e.g., Mike).
5.  Give your bot a username. Ensure it ends in "bot" and that it is one word (e.g., newo\_bot). The username must be unique and not in use by someone else.
6.  Once you have successfully given your bot a username, you can access it via the link "t.me/\[username\]." Also, copy the HTTP API token to your clipboard.

### 

Create a Telegram Connector

[](#create-a-telegram-connector)

A Telegram connector needs to be created, which will be used to create an Event Subscription.

1.  Click the **plus** icon on the “Telegram Integration” item.
2.  Fill in the connector "Title" and "Idn." For this use case, let's say both are "telegram\_connector."
3.  Paste the HTTP API token into the "Telegram API Token" field.
4.  Select the "Agent" you want to respond to messages in Telegram. In this case, you can use an existing agent from past examples (e.g., "Embedded Instructions" or "Embedded Context" agents.).
5.  Click **Save**.

### 

Enable the Telegram Connector

[](#enable-the-telegram-connector)

Once a connector is created, its status will be "Stopped," and you will need to enable it.

1.  Click the **three dots** icon on the right of the created connector.
2.  Click **Run**.

### 

Create an Event (Telegram Integration)

[](#create-an-event-telegram-integration)

1.  Navigate to your agent's Flow. The agent should be the same one you selected when setting up a Telegram connector.
2.  Click the **plus** icon next to the Event Subscription section on the left-side panel.
3.  Under the “Event Idn,” select “user\_message” from the dropdown.
4.  Under “Integration,” select “telegram” from the dropdown.
5.  Under “Connector,” select “telegram\_connector” from the dropdown.
6.  Under “Skill selector,” select “skill\_idn” from the dropdown. You are telling your flow that when a user messages the Telegram bot, select a specific Skill to activate.
7.  In this case, you want to activate the main Skill of your agent. Select it from the “Skill name” dropdown.
8.  Add an “Event description.” This field is optional but will help in the future when identifying the purpose of an event from a complex flow containing multiple event subscriptions.
9.  Click **Create** to save the event.

### 

Test Functionality

[](#test-functionality)

1.  Click **Save and Publish** in the top-right corner of the Flow Builder.
2.  Within your newly created Telegram bot, click **Start**.
3.  Send a message and your digital employee should respond.

Updated 4 months ago

* * *
