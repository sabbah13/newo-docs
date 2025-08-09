GetCurrentPrompt

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetCurrentPrompt

Search

All

Pages

###### Start typing to search…

# GetCurrentPrompt

The GetCurrentPrompt action retrieves the current Skill's prompt.

```
GetCurrentPrompt()
```

### 

Example

[](#example)

Skill ScriptResponse

```
{{#system~}}
This is some very smart prompt I am about to feed to LLM
{{~/system}}
{{set(
    name="current_prompt",
    value=GetCurrentPrompt()
)}}
{{SendMessage(message=current_prompt)}}
```

```
This is some very smart prompt I am about to feed to LLM.
```

Updated 4 months ago

* * *
