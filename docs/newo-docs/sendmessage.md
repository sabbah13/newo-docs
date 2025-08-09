SendMessage

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

SendMessage

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# SendMessage

Send a message to users/actors.

`SendMessage(     message: str,     actorIds: List[str],     useFilter: bool = false,     **arguments: str )`

#### 

Where:

[](#where)

*   **message:** The message string you want to send.
*   **actorIds:** List of actor IDs to whom the message needs to be sent.
*   **useFilter:** A boolean value that switches off filtering capabilities to show/hide certain placeholder text.
*   **\*\*arguments:** Arbitrary arguments sent along with the message.

### 

Example 1

[](#example-1)

Send a "Test message" to the current user.

`{{SendMessage(message="Test message", argument1="value", testValue="argument value 2")}}`

#### 

Where:

[](#where-1)

*   argument1 and testValue are the arguments that will be sent to the user along with the message.

### 

Example 2

[](#example-2)

Send a "Test message" to the user with the email: [helloworld@newo.ai](mailto:helloworld@newo.ai)

`{{SendMessage(message="Test message", actorIds=GetActors(externalId="helloworld@newo.ai", integrationIdn="email", connectorIdn="gmail"))}}`

### 

Example 3

[](#example-3)

Send a "Test message" to all users who have an actor with integrationIdn="sandbox" and connectorIdn="mysandbox."

`{{SendMessage(message="Test message", actorIds=GetActors(integrationIdn="sandbox", connectorIdn="mysandbox"))}}`

### 

Example 4

[](#example-4)

Send a "Test message" to the current user on the connector with integrationIdn="sandbox" and connectorIdn="mysandbox."

`{{SendMessage(message="Test message", actorIds=GetActors(personaId=GetUser(field="id"), integrationIdn="sandbox", connectorIdn="mysandbox"))}}`

### 

Example 5

[](#example-5)

Set up any connector that takes filtered messages (e.g., Telegram or Vapi). Messages you see in the Sandbox chat are source messages, which means you will not see filtered messages. The filtered message within \[\[\[text\]\]\] is removed when setting useFilter to true.

Skill ScriptResponse

`   {{SendMessage(message="Your code is: [[[beef]]]!")}} {{SendMessage(message="Your code is: [[[beef]]]!", useFilter=True)}}   `

`   Your code is: [[[beef]]]! Your code is: !   `

Updated 4 months ago

* * *

Did this page help you?

Yes

No
