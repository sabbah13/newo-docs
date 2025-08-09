UpdateAkb

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

UpdateAkb

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# UpdateAkb

The UpdateAkb action updates an AKB topic if the topic’s ID is known.

`UpdateAkb(   id: str,   **other_fields )`

#### 

Where:

[](#where)

*   **id:** The ID of the topic you want to update.
*   \***\*other\_fields:** The fields to update with a defined value.
    *   **id:** str
    *   **summary:** str | None = None
    *   **facts:** str | list\[str\] | None = None
    *   **name:** str | None = None
    *   **confidence:** float | None = None
    *   **source:** str | None = None
    *   **labels:** str | list\[str\] | None = None

### 

Example

[](#example)

Skill Script

`   {{SetManualAkb(personaId=GetAgent(field="id"), summary="summary text - original", facts=["2 times 2 equals four"], confidence=1, labels="performance_ping_test")}}  {{set(name="akbSemanticId", value=SearchSemanticAkb(query="2 times 2", filterByPersonasIds=GetAgent(field="id"), labels="performance_ping_test", fields="id"))}}  {{UpdateAkb(id=akbSemanticId, summary="summary text - new")}}   `

This Skill Script will create an AKB topic, use semantic search to get the topic ID, and then update the topic with new summary text. If you’d like to test this out to ensure it works, you can do the following:

1.  Comment out the UpdateAkb action, run the Skill Script, and see that an AKB topic is created with "summary text - original."
2.  Uncomment the UpdateAkb action, comment out the SetManualAkb action, run the Skill Script, and check to see if the AKB topic was updated with "summary text - new."

Updated 4 months ago

* * *

Did this page help you?

Yes

No
