Dummy

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Dummy

Search

All

Pages

###### Start typing to search…

# Dummy

The Dummy action is a placeholder that serves no operational purpose. It is often used for testing, debugging, or marking sections of a workflow for future updates.

```
DUMMY()
```

### 

Example

[](#example)

```
{{#if IsEmpty(text=greetingPhraseInstruction)}}
    {{DUMMY("This section was triggered")}}
		{{Set(name="base_instruction", value="Mention call reason from the context in the greeting phrase.")}}
{{else}}
    {{Set(name="base_instruction", value="Strictly follow the greeting phrase instruction.")}}
{{/if}}
```

Updated 4 months ago

* * *
