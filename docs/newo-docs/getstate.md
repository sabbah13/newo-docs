GetState

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetState

Search

All

Pages

###### Start typing to search…

# GetState

The GetState action reads a value to a specific Flow State field. For this action to work, the Flow needs to have a State Field with this exact name.

```
GetState(
  name= "<State Field name>",
)
```

### 

Example

[](#example)

Skill ScriptResponse

```
{{SetState(name= "my_state_field", value= "My Very Important Value")}}
{{set(name="my_state_field_value", value=GetState(name="my_state_field"))}}    
{{SendMessage(message=my_state_field_value)}}
```

```
My Very Important Value
```

  

Updated 4 months ago

* * *
