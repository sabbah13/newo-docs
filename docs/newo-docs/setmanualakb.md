SetManualAkb

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

SetManualAkb

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# SetManualAkb

The SetManualAkb action adds a new topic to the AKB based on defined values.

`SetManualAkb(   personaId: str,   summary: str,   facts: List[str],   name: str | None = None,   confidence: int | None = None,   source: str | None = None,   labels: List[str] | None = None )`

#### 

Where:

[](#where)

*   **personaId:** UUID of a specific user persona.
*   **summary:** Topic information you want to store in the AKB.
*   **facts:** Topic facts, which are used for fuzzy and semantic searches.
*   **name:** The name of the AKB topic.
*   **confidence:** A number from 1 to 100 indicating the percentage of confidence in the topic information (1 being the lowest and 100 being the highest confidence).
*   **source:** The name of the source of the AKB information, allowing you to later search for AKB topics based on its source.
*   **labels:** The labels you’re attaching to the AKB topics you're creating.

### 

Example

[](#example)

The below example creates a new item in the AKB with defined values.

`{{SetManualAkb(personaId=GetAgent(field="id"), summary="summary text", facts=["2 times 2 equals four", "random fact"], name="Topic name", confidence="100", source="example", labels=["test", "sample"])}}`

Check the AKB for a newly created topic with the details stated in the Skill Script.

Updated 4 months ago

* * *

Did this page help you?

Yes

No
