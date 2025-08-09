SetAkb

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

SetAkb

Search

All

Pages

###### Start typing to search…

# SetAkb

The SetAkb action converts context information into an AKB topic by extracting facts and creating a summary. This differs from the SetManualAkb action in that this action only requires context and the topic is created automatically using an LLM.

```
SetAkb(
  context: str, 
  labels: list[str] | None = None, 
  providerIdn: str | None = None, 
  modelIdn: str | None = None, 
  personaId: str | None = None
)
```

#### 

Where:

[](#where)

*   **context:** The information you’re providing to convert into an AKB topic.
*   **labels:** The labels you’re attaching to the AKB topic you're creating.
*   **providerIdn:** Not currently used.
*   **modelIdn:** Not currently used.
*   **personaId:** Attaches a persona ID to the created AKB topic for later filtering.

### 

Example

[](#example)

The example below creates an AKB topic based on a message sent in the Sandbox chat, specifically, “In mathematics, the Pythagorean theorem or Pythagoras' theorem is a fundamental relation in Euclidean geometry between the three sides of a right triangle.” A semantic search then targets this topic and outputs the facts and summary.

Skill ScriptResponse

```
{{SetAkb(context=GetTriggeredAct(fields=['text']))}}

{{set(name="searchValue", value=SearchSemanticAkb(query="pythagoras", fields=["facts", "summary"]))}}

{{SendMessage(message=searchValue)}}
```

```
['The Pythagorean theorem is related to mathematics.', "The Pythagorean theorem is also known as Pythagoras' theorem.", 'The Pythagorean theorem is a fundamental relation in Euclidean geometry.', 'The Pythagorean theorem involves the three sides of a right triangle.']  

Two people discussed the Pythagorean theorem, which is a crucial principle in Euclidean geometry. It establishes a relationship between the three sides of a right-angled triangle.
```

Updated 4 months ago

* * *
