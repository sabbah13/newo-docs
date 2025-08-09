SetAgent

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

SetAgent

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# SetAgent

The SetAgent action assigns a value to a specific field of an Agent Persona.

`SetAgent(   name= "title" | "description" | "name",   value= "&lt;new value of the field&gt;" )`

Example

Skill ScriptResponse

`   {{!Read the current Agent name}} {{set(name="agent_name", value=GetAgent(field="name"))}} {{SendMessage(message=agent_name)}} {{!Change the Agent name}} {{SetAgent(name="name", value="New Agent Name")}} {{!Read the changed Agent name}} {{set(name="agent_name", value=GetAgent(field="name"))}} {{SendMessage(message=agent_name)}}   `

`   Old Agent Name New Agent Name   `

  

Updated 4 months ago

* * *

Did this page help you?

Yes

No
