SendSystemEvent

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

SendSystemEvent

Search

All

Pages

###### Start typing to search…

# SendSystemEvent

Sends any custom system event with the given arguments.

```
SendSystemEvent(
  eventIdn: str,
  actorIds: List[str] | None,
  global: Literal['true', 'false'],
  **arguments: str
)
```

#### 

Where:

[](#where)

*   **eventIdn:** Any custom eventIdn.
*   **actorIds:** List of actors to send this event to. Use action [GetActors](getactors.md) to get the list of actors. If this parameter is not set, the current actor is used.
*   **global:** If "true," the event is sent as global. In this case, the "actorIds" parameter is ignored.
*   **\*\*arguments:** Arbitrary arguments sent along with the message.

### 

Example 1 (Send custom system event with arguments)

[](#example-1-send-custom-system-event-with-arguments)

In this example, the SendSystemEvent action is used to send arguments. Arguments can also be sent using an API or integration.

Skill to send custom arguments:

```
{{#system~}}
{{#block(hidden=True)}}

{{set(name="agent", value=GetAgent())}}
{{set(name="memory", value=GetMemory(count=40, maxLen=20000))}}

{{/block}}

{{memory}}
{{agent}}:

{{~/system}}

{{#assistant~}}
{{gen(name="RESULT", temperature=0.7)}}
{{~/assistant}}

{{#system~}}

{{!Here we send a system event "my_custom_event" with arguments: "last_user_message_text", "last_agent_message_text", "my_argument_1", "my_argument_2"}}

{{SendSystemEvent(eventIdn="my_custom_event", last_user_message_text=GetTriggeredAct(fields=['text']),
last_agent_message_text=RESULT, my_argument_1="MY ARGUMENT VALUE 1", my_argument_2="MY ARGUMENT VALUE 2")}}

{{SendMessage(message="event sent")}}
 
{{~/system}}
```

Skill to get the arguments of the event "my\_custom\_event". This Skill should be executed by subscribing to the event "system/system/my\_custom\_event":

```
{{set(name='act_info', value=GetTriggeredAct(fields=['timeInterval', 'datetime', 'person', 'my_argument_1', 'my_argument_2', 'last_user_message_text', 'last_agent_message_text']))}}

{{SendMessage(message=act_info, actorIds=GetActors(personaId=GetUser(field="id"), integrationIdn="sandbox", connectorIdn="test_connector"))}}
```

#### 

Response:

[](#response)

```
0
2024-01-21 12:32:00.784000
Alex
MY ARGUMENT VALUE 1
MY ARGUMENT VALUE 2
What is your name?
My name is Morfeus.
```

Updated 4 months ago

* * *
