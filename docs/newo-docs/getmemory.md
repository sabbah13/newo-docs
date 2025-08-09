# GetMemory

Returns a list of actions (including but not limited to the messages). Currently, it only returns actions that have reference\_idn: user\_message and agent\_message.

```
GetMemory(
  fromPerson: Literal["User", "Agent", "Both"],
  offset: str,
  count: str,
  maxLen: str,
  asEnglishText: str,
  summarize: str,
  fromDate: str,
  toDate: str,
  filterByActorIds: str,
  filterByUserPersonaIds: str
)
```

*   **fromPerson:** Indicates what persona the memory should be sourced from.
*   **offset:** Offsets where the start of the pulled memory begins. In other words, offset is used when wanting to skip a certain number of the latest dialogue turns.
*   **count:** The number of conversational turns.
*   **maxLen:** The maximum number of characters.
*   **asEnglishText:** Converts any foreign language text into English. Set "true" to activate. The default is "false."
*   **summarize:** Summarizes the memory. Set "true" to activate. The default is "false."
*   **fromDate:** Filters start of turns and accepts ISO-8601 format.
*   **toDate:** Filters end of turns and accepts ISO-8601 format.
*   **filterByActorIds:** Filters the memory based on Actor IDs and shows only that memory.
*   **filterByUserPersonaIds:** Filters the memory based on Persona IDs and shows only that memory.

If filterByActorIds is set, the context user\_persona\_id and filterByUserPersonaIds parameters are ignored. If the filterByUserPersonaIds parameter is set, the context user\_persona\_id parameter is ignored.

This example uses the GetMemory command to send historical conversations to an LLM to provide a response. It allows for general conversations with your agent. Adjust the GetMemory parameters according to your needs.

```
{{#system~}}
{{#block(hidden=True)}}
{{set(name="agent", value=GetAgent())}}
{{set(name="user_", value=GetUser())}}
{{set(name="memory", value=GetMemory(count=40, maxLen=20000))}}
{{/block}}

AGENT-USER MEMORY
{{memory}}
{{agent}}:
{{~/system}}

{{#assistant~}}
{{gen(name="RESULT", temperature=0.75)}}
{{~/assistant}}
```

```
User: How are you?  
Agent: I'm fine!  
User: Tell me about yourself.  
```

```
Agent: I'm an AI assistant.
```

This example gets the memory and translates any foreign language text into English. This was tested by sending the foreign language (Afrikaans) message, "Hello hoe gaan dit?"

```
{{set(name="memory", value=GetMemory(count="10",maxLen="2000",asEnglishText="True"))}}  

{{SendMessage(message=memory)}} 
```

```
User: Hello hoe gaan dit?
```

```
User: Hello hoe gaan dit?
User: Hello how are you?
```

If you need to skip a certain number of the latest dialogue instances, use the offset parameter.

```
{{set(name="memory", value=GetMemory(offset="2",count="10",maxLen="2000"))}}  

{{SendMessage(message=memory)}}
```

```
User: How are you?  
Agent: I'm fine!  
User: Tell me about yourself.  
Agent: I'm an AI assistant.
```

```
User: How are you?  
Agent: I'm fine! 
```

In an instance where you are dealing with multiple actors/personas, you may want to filter the memory based on their IDs. The example below creates two new personas and actors and sends various messages. The Sandbox chat message is then the filtered result showing one of the actor ID messages. This illustrates the filtering capabilities. The below example can be done by targeting the persona IDs as well instead of the actor IDs.

```
{{set(name="persona_id_one", value=CreatePersona(name="Martin"))}}
{{set(
   name="actor_id_one",
   value=CreateActor(
       integrationIdn="sandbox",
       connectorIdn="connector_one",
       externalId="1234567890",
       personaId=persona_id_one,
       timeZone="America/Los_Angeles"
   )
)}}

{{SendMessage(message="Martin's message 1", actorIds=actor_id_one)}}
{{SendMessage(message="Martin's message 2", actorIds=actor_id_one)}}
{{SendMessage(message="Martin's message 3", actorIds=actor_id_one)}}
{{SendMessage(message="Martin's message 4", actorIds=actor_id_one)}}


{{set(name="persona_id_two", value=CreatePersona(name="Lauren"))}}
{{set(
   name="actor_id_two",
   value=CreateActor(
       integrationIdn="sandbox",
       connectorIdn="connector_two",
       externalId="1234567890",
       personaId=persona_id_two,
       timeZone="America/Los_Angeles"
   )
)}}

{{SendMessage(message="Lauren's message 1", actorIds=actor_id_two)}}
{{SendMessage(message="Lauren's message 2", actorIds=actor_id_two)}}
{{SendMessage(message="Lauren's message 3", actorIds=actor_id_two)}}
{{SendMessage(message="Lauren's message 4", actorIds=actor_id_two)}}

{{set(name="memory", value=GetMemory(filterByActorIds=actor_id_two))}}
{{SendMessage(message=memory)}}
```

```
Agent: Lauren's message 1
Agent: Lauren's message 2
Agent: Lauren's message 3
Agent: Lauren's message 4
```

Updated 4 months ago

* * *
