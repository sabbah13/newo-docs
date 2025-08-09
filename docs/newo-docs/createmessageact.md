CreateMessageAct

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

CreateMessageAct

Search

All

Pages

###### Start typing to search…

# CreateMessageAct

When using the SendMessage action, a message is sent to a user and then added to the Chronicle. The Chronicle is a service that stores the history of events (including messages). Sometimes, we want to add a message to the Chronicle manually without sending a message to the user. The CreateMessageAct action does not send anything to anyone, it only adds a message to the Chronicle.

```
CreateMessageAct(
  text: str,
  from: Literal["agent", "user"],
  userPersonaId: str | None,
  userActorId: str | None,
  agentPersonaId: str | None,
  **args
)
```

### 

Example

[](#example)

Some of the Newo integrations (Vapi, Newo Chat, etc.) have a greeting phrase setting. The greeting phrase is sent to a user when the conversation starts (e.g., Vapi answers the phone or Newo Chat is opened). You can view the greeting phrase within the conversation\_started item within the logs.

The issue is that the greeting phrase bypasses the Chronicle and does not make it to the memory even though a user hears the greeting phrase. As such, if you wanted to include the greeting phrase in memory, you would use the CreateMessageAct action.

Updated 4 months ago

* * *
