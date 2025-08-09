IsEmpty

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

IsEmpty

Search

All

Pages

###### Start typing to search…

# IsEmpty

Determines whether the string is empty or not.

```
IsEmpty(text: str) -> Literal["t", ""]
```

#### 

Where:

[](#where)

*   **text:** test string.

### 

Example 1

[](#example-1)

This example requires the creation of a State Field with the name "test\_flag" and any scope.

```
{{#system~}}
{{#block(hidden=True)}}

{{set(name="test_flag_", value=GetState(name="test_flag"))}}

{{/block}}

{{#if IsEmpty(text=test_flag_)}}

{{SendMessage(message="test_flag is empty")}}

{{SetState(name='test_flag', value="YES")}}

{{else}}

{{SendMessage(message="test_flag is not empty")}}

{{SetState(name='test_flag', value=" ")}}

{{/if}}

{{~/system}}
```

Updated 4 months ago

* * *
