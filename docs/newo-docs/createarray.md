CreateArray

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

CreateArray

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# CreateArray

The CreateArray action creates an array of arbitrary values. You can pass any string literals or variables as parameters to this action.

`CreateArray(   "&lt;string literal&gt;" | &lt;variable&gt; {, "&lt;string literal&gt;" | &lt;variable&gt;} )`

### 

Example

[](#example)

Skill ScriptResponse

`   {{set(name="my_value", value="something-something")}} {{set(     name="new_array",     value=CreateArray("1", "2", "777", my_value) )}} {{SendMessage(message=new_array)}}   `

`   1 2 777 something-something   `

  

Updated 4 months ago

* * *

Did this page help you?

Yes

No
