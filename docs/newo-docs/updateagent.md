UpdateAgent

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

UpdateAgent

Search

All

Pages

###### Start typing to search…

# UpdateAgent

The UpdateAgent action updates specific attributes of an agent, namely, the title and description.

```
UpdateAgent(  
    idn: str = None,  
    name: Literal["title", "description"],  
    value: str  
)
```

**Where:**

*   **idn:** (Optional) Provide the agent's ID. Defaults to None.
*   **name:** Specify the name of the value to update (title or description).
*   **value:** Provide the new value for the title or description.

Updated 4 months ago

* * *
