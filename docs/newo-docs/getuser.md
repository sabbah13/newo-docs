GetUser

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetUser

Search

All

Pages

###### Start typing to search…

# GetUser

Returns the values associated with a specific user.

```
GetUser(
  field: str, 
  personaId: str | None = None
)
```

#### 

Where:

[](#where)

*   **field:** Literal\[“id”, “title”, “description”, “name”, “type”\] = “name”

### 

Example 1

[](#example-1)

A basic example with no GetUser field strings and returning the user's name. In this case, the user is named Susan.

```
{{set(name='user_', value=GetUser())}}

{{SendMessage(message=user_)}}
```

#### 

Response: Susan

[](#response-susan)

Updated 4 months ago

* * *
