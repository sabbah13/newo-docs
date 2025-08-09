GetAgent

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetAgent

Search

All

Pages

###### Start typing to search…

# GetAgent

The GetAgent action retrieves information about the current Agent. The current Agent is the one you are currently working in the context of. For example, if you use GetAgent in any Skill of My Receptionist Agent, you will get this specific agent information.

```
GetAgent(
  field: str
)
```

#### 

Where:

[](#where)

*   **field:** Literal\["id", "title", "description", "name"\]

### 

Example 1 (No Field)

[](#example-1-no-field)

A basic example with no GetAgent field strings returning the agent's name. In this case, the agent is named Mike.

Skill ScriptResponse

```
{{set(name="agent_", value=GetAgent())}}

{{SendMessage(message=agent_)}}
```

```
Mike
```

### 

Example 2 (Specific Field)

[](#example-2-specific-field)

This example of the GetAgent action specifies a specific field to return. In this case, the agent's title is Hotel Receptionist. Only one field can be specified at a time.

Skill ScriptResponse

```
{{set(name="agent_", value=GetAgent(field="title"))}}

{{SendMessage(message=agent_)}}
```

```
Hotel Receptionist
```

Updated 4 months ago

* * *
