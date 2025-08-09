GetActors

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetActors

Search

All

Pages

###### Start typing to search…

# GetActors

Returns a list of actors corresponding to the filters used (personaId, externalId, integrationIdn, connectorIdn).

```
GetActors(
	personaId: str | None = None,
	externalId: str | None = None,
	integrationIdn: str | None = None,
  connectorIdn: str | None = None,
	fields: List[str] =  [“id”]
)
```

#### 

Where:

[](#where)

*   **fields:** \[“id”, “name”, “timeZone”\]

### 

Example (Return Actors)

[](#example-return-actors)

The following example returns the actor's external Id:

```
{{set(name='actor_', value=GetActors(personaId=GetUser(field="id"), integrationIdn="sandbox",connectorIdn="connector_test"))}}

{{SendMessage(message=actor_)}}
```

#### 

Response: 938f4372-4752-4196-8582-b8ae1518d36b 9cc49ca5-3c0c-4e9f-946a-cdd6bb8d3770

[](#response-938f4372-4752-4196-8582-b8ae1518d36b-9cc49ca5-3c0c-4e9f-946a-cdd6bb8d3770)

Updated 4 months ago

* * *
