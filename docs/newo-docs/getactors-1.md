# GetActors

The GetActors action receives a list of actors filtered out by a condition set in the action parameters. Specify what actor field you want to see using the fields parameter.

```
GetActors(
  fields=["<field_name>" `{`, "<field_name>"`}`],
  personaId="<Id of a Persona>" | None,
  externalId="<externalId of an Actor>" | None,
  integrationIdn="<Idn of an integration>" | None,
  integrationIdn="<Idn of a connector>" | None
)
```

```
{{! Create "John Doe" Persona and its Actor}}
{{set(name="persona_id", value=CreatePersona(name="John Doe"))}}
{{set(
    name="actor_id",
    value=CreateActor(
        integrationIdn="sandbox",
        connectorIdn="connector",
        externalId="12345678902",
        personaId=persona_id,
        timeZone="America/Los_Angeles"
    )
)}}
{{! Create "Jane Doe" Persona and its Actor}}
{{set(name="persona_id", value=CreatePersona(name="Jane Doe"))}}
{{set(
    name="actor_id",
    value=CreateActor(
        integrationIdn="sandbox",
        connectorIdn="connector",
        externalId="12345678903",
        personaId=persona_id,
        timeZone="America/Los_Angeles"
    )
)}}
{{! Get the actors list}}
{{set(
        name="actors",
        value=GetActors(
            fields=["name", "externalId","timeZone"],
            integrationIdn="sandbox",
            connectorIdn="connector"
        )
    )
}}
{{SendMessage(message=actors)}}
```

```
John Doe
12345678902
America/Los_Angeles

Jane Doe
12345678903
America/Los_Angeles
```

  

Updated 4 months ago

* * *
