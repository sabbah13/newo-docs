CreateActor

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

CreateActor

Search

All

Pages

###### Start typing to search…

# CreateActor

The CreateActor action creates a new Actor for any Persona (User or Agent). The action will create a new Actor for the “persona\_id” you pass for the integration-connector pair “integration\_idn” and “connector\_idn.”

The action will return the universally unique identifier (UUID) of the actor created. You can specify the local timezone for the Actor using any identifiers from [this list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

```
CreateActor(
      integrationIdn="<Idn of the integration>",
      connectorIdn="<Idn of the integration>",
      externalId="<External ID of the Actor>",
      personaId=`{persona_id}`,
      timeZone="TZ identifier" | None
)
```

### 

Example

[](#example)

Skill ScriptResponse

```
{{set(name="persona_id", value=CreatePersona(name="My User Persona name"))}}
{{set(
    name="actor_id",
    value=CreateActor(
        integrationIdn="sandbox",
        connectorIdn="connector",
        externalId="1234567890",
        personaId=persona_id,
        timeZone="America/Los_Angeles"
    )
)}}
```

```
UUID of the actor created. For example, “2b3614g4-ca14-4555-947a-8f8d78cda019.”
```

  

Updated 4 months ago

* * *
