Multiline Commenting

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Multiline Commenting

Search

All

Pages

###### Start typing to search…

# Multiline Commenting

In some instances, you may need to comment out multiple lines of code quickly. Here’s how to do it:

1.  Select/highlight the code you want to comment out.
2.  For Mac, press **Command + /**. For Windows, press **Ctrl + /**.

The lines you selected will be encased with the {{!-- This is a comment --}} syntax.

### 

Example

[](#example)

```
{{!-- {{#system~}}
{{set(name='agent_', value=GetAgent())}}
{{set(name='memory', value=GetMemory(count=40, maxLen=20000))}}

You are a sales agent named {{agent_}} and work for a multinational corporation.

AGENT-USER CONVERSATION:

{{memory}}
{{agent_}}:{{~/system}}

{{#assistant~}}
{{gen(name='RESULT', temperature=0.75)}}
{{~/assistant}} --}}
```

  

Updated 4 months ago

* * *
