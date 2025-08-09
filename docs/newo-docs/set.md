Set

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Set

Search

All

Pages

###### Start typing to search…

# Set

The Set action assigns a value to a named variable, which can be used throughout the skill/workflow.

```
Set(
    name: str,
    value: str,
    expose: bool = False
)
```

**Where:**

*   **name:** Specify the name of the variable to set.
*   **value:** Provide the value to assign to the variable.
*   **expose:** (Optional) Specify whether to expose the variable externally. Defaults to False.

### 

Example 1

[](#example-1)

```
Set(name="customer_preference", value="outside seating", expose=True)
Return(val=GetPersonaAttribute(id="persona_123", field="preference"))
```

The above code snippet assigns "outside seating" to the variable customer\_preference and exposes it for use outside the current skill.

### 

Example 2

[](#example-2)

jinja

```
{{#if IsEmpty(text=greetingPhraseInstruction)}}
    {{Set(name="base_instruction", value="Mention call reason from the context in the greeting phrase.")}}
    {{Set(name="base_context", value=Concat("call reason: ", callReason))}}
{{else}}
    {{Set(name="base_instruction", value="Strictly follow the greeting phrase instruction.")}}
    {{Set(name="base_context", value=Concat("greeting phrase instruction: ", greetingPhraseInstruction))}}
{{/if}}
```

Here:

*   If `greetingPhraseInstruction` is empty:
    
    *   `base_instruction` is set to: **"Mention call reason from the context in the greeting phrase."**
    *   `base_context` is set to: **"call reason: " + callReason** (using the `Concat` function). `callReason` can be retrieved from another skill or set in the same skill.
*   If `greetingPhraseInstruction` is **not empty**:
    
    *   `base_instruction` is set to: **"Strictly follow the greeting phrase instruction."**
    *   `base_context` is set to: **"greeting phrase instruction: " + greetingPhraseInstruction**.

Later in the system block, these set variables can be referenced:

jinja

```
{{base_instruction}}
{{base_context}}
```

Updated 4 months ago

* * *
