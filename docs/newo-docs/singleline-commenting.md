Singleline Commenting

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Singleline Commenting

Search

All

Pages

###### Start typing to search…

# Singleline Commenting

Commenting within the Skill Script is used to:

*   Explain a particular line of code.
*   Debug a line code to prevent it from executing, which is useful during testing.
*   Make code more readable by breaking it up and providing helpful notes and context.

A line of code can be commented out using the `{{! This is a comment }}` syntax.

### 

Example

[](#example)

```
{{#system~}}
{{set(name='agent_', value=GetAgent())}}  {{! Sets the name of the agent to the variable "agent_" }}

{{! set(name='user_', value=GetUser()) }}

{{set(name='memory', value=GetMemory(count=40, maxLen=20000))}}

{{! Brief bio of the agent and their role }}
You are a sales agent named {{agent_}} and work for a multinational corporation.

AGENT-USER CONVERSATION:

{{memory}}
{{agent_}}:{{~/system}}

{{#assistant~}}
{{gen(name='RESULT', temperature=0.75)}}
{{~/assistant}}
```

  

Updated 4 months ago

* * *
