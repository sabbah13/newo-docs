GetLatestMessageActor

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetLatestMessageActor

Search

All

Pages

###### Start typing to search…

# GetLatestMessageActor

The GetLatestMessageActor action retrieves information about the actor whose message triggered the current Skill. We specify what field of the Actor we want to receive using the field parameter. The default value of the field parameter is "name."

```
GetLatestMessageActor(
  field= "id" | "name" | "timeZone" | "integrationIdn" | "connectorIdn" | "externalId" | "personaId"
)
```

### 

Example

[](#example)

```
{{set(
    name="latest_message_actor",
    value=GetLatestMessageActor()
)}}
{{SendMessage(message=latest_message_actor)}}
```

This example returns the name of the Actor whose message has triggered the current Skill.

Updated 4 months ago

* * *
