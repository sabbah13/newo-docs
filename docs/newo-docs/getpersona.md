GetPersona

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetPersona

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# GetPersona

The GetPersona aсtion retrieves a specific field value of a specific Persona. The Persona you want can be received by passing its persona\_id. The field you want can be received by passing its name in the field parameter.

`GetPersona(   id="<UUID of the Persona>",   field="id | title | description | name | type" )`

Example

Skill ScriptResponse

`   {{set(name="persona_id", value=CreatePersona(name="My User Persona name"))}} {{set(     name="persona_name",     value=GetPersona(         id=persona_id,         field="name"     ) )}} {{SendMessage(message=persona_name)}}   `

`   My User Persona name   `

  

Updated 4 months ago

* * *

Did this page help you?

Yes

No
