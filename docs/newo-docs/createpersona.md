CreatePersona

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

CreatePersona

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# CreatePersona

The CreatePersona action creates a new User Persona. The User Persona name will be the one you pass as a parameter. The action will return the universally unique identifier (UUID) of the persona created.

`CreatePersona(   name="My User Persona name" )`

### 

Example

[](#example)

Skill ScriptResponse

`   {{set(name="persona_id", value=CreatePersona(name="My User Persona name"))}} {{SendMessage(message=persona_id)}}   `

`   UUID of the persona created. For example, "7a1644f4-cd26-4575-947a-8f9d75caa073."   `

  

Updated 4 months ago

* * *

Did this page help you?

Yes

No
