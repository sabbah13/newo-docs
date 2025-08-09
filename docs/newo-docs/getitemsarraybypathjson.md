GetItemsArrayByPathJSON

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetItemsArrayByPathJSON

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# GetItemsArrayByPathJSON

Returns an element within an array based on a JSON path.

`GetItemsArrayByPathJSON(   array: str,    filterPath: str )`

#### 

Where:

[](#where)

*   **array:** An array in the format '\[{"first\_name": "Brad", "last\_name": "Pitt"}\]\[{"first\_name": "Brad", "last\_name": "Pitt"}\]' for example.
*   **filterPath:** A string in JSONPath format to traverse the path to an element in a JSON structure.

### 

Example

[](#example)

The example below returns an element in an array by specifying its JSONPath.

Skill ScriptResponse

`   {{set(    name="MyArray",    value=AppendItemsArrayJSON(        array="[]",        items=[            '{                "first_name": "Brad",                "last_name": "Pitt"            }',            '{                "first_name": "Matt",                "last_name": "Damon"            }'        ]    ) )}}  {{SendMessage(message=MyArray)}}  {{set(     name="PathArray",     value=GetItemsArrayByPathJSON(         array=MyArray,          filterPath="[1].first_name"         ) )}}  {{SendMessage(message=PathArray)}}   `

`   [\{"first_name":"Brad","last_name":"Pitt"},\{"first_name":"Matt","last_name":"Damon"}]  [\{"first_name":"Matt","last_name":"Damon"}]   `

  

Updated 4 months ago

* * *

Did this page help you?

Yes

No
