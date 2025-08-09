GetActor

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetActor

Search

All

Pages

###### Start typing to search…

# GetActor

The GetActor action retrieves a specific field value of a specific Actor. Specify the Actor you want to get by passing its UUID. If the Actor UUID is omitted, the current Actor will be used (i.e., the Actor whose context you are currently in). Specify the name of the field you want to get by passing its name in the field parameter.

```
GetActor(
  field="id | name | timeZone | integrationIdn | connectorIdn | externalId | personaId",
  id= "&lt;Id of an Actor&gt;" | None
)
```

### 

Example 1

[](#example-1)

Skill ScriptResponse

```
{{set(name="external_id", value=GetActor(field="externalId"))}}
{{SendMessage(message=external_id)}}
```

```
External ID of the current actor. For example, “s2SiH1.”
```

### 

Example 2

[](#example-2)

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
{{set(name="time_zone", value=GetActor(field="timeZone"))}}
{{SendMessage(message=time_zone)}}
```

```
America/Los_Angeles
```

  

Updated 4 months ago

* * *
