DeleteAkb

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

DeleteAkb

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# DeleteAkb

The DeleteAkb action deletes an AKB topic if the topic’s ID is known.

`DeleteAkb(   ids: str | list[str] )`

#### 

Where:

[](#where)

*   **ids:** The ID of the topic you want to delete.

### 

Example

[](#example)

Skill Script

`   {{SetManualAkb(personaId=GetAgent(field="id"), summary="summary text", facts=["2 times 2 equals four"],confidence=1, labels="performance_ping_test")}}  {{set(name="akbSemanticId", value=SearchSemanticAkb(query="2 times 2", filterByPersonasIds=GetAgent(field="id"), labels="performance_ping_test", fields="id"))}}  {{SendMessage(message=akbSemanticId)}}  {{DeleteAkb(ids=akbId)}}   `

This Skill Script will create an AKB topic, use semantic search to get the topic ID, and then delete the topic. If you’d like to test this out to ensure it works, you can do the following:

1.  Comment out the DeleteAkb action, run the Skill Script, and see that an AKB topic is created.
2.  Uncomment the DeleteAkb action, comment out the SetManualAkb action, run the Skill Script, and check to see if the AKB topic was deleted.

Updated 4 months ago

* * *

Did this page help you?

Yes

No
