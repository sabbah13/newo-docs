GetItemsArrayByIndexesJSON

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetItemsArrayByIndexesJSON

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# GetItemsArrayByIndexesJSON

Finds an element within an array using an index, a numerical value that indicates the position of the item, starting from zero where the first element is accessed with an index of 0, the second with 1, and so on.

`GetItemsArrayByIndexesJSON(   array: str,    indexes: str | list[str] )`

#### 

Where:

[](#where)

*   **array:** An array in the format '\[{"first\_name": "Brad", "last\_name": "Pitt"}\]\[{"first\_name": "Brad", "last\_name": "Pitt"}\]' for example.
*   **indexes:** A string or list of strings representing a numerical value indicating the position of an element in an array.

### 

Example

[](#example)

The example below finds the first and fourth elements in an array and displays the result in the Sandbox chat.

Skill ScriptResponse

`   {{set(    name="MyArray",    value=AppendItemsArrayJSON(        array="[]",        items=[            '{                "first_name": "Brad",                "last_name": "Pitt"            }',            '{                "first_name": "Matt",                "last_name": "Damon"            }',            '{                "first_name": "Leonardo",                "last_name": "DiCaprio"            }',            '{                "first_name": "Robert",                "last_name": "De Niro"            }'        ]    ) )}}  {{SendMessage(message=MyArray)}}  {{set(    name="FirstAndLast",    value=GetItemsArrayByIndexesJSON(        array=MyArray,        indexes=["0", "3"]) )}}  {{SendMessage(message=FirstAndLast)}}   `

`   [\{"first_name":"Brad","last_name":"Pitt"},\{"first_name":"Matt","last_name":"Damon"},\{"first_name":"Leonardo","last_name":"DiCaprio"},\{"first_name":"Robert","last_name":"De Niro"}]  [\{"first_name":"Brad","last_name":"Pitt"},\{"first_name":"Robert","last_name":"De Niro"}]   `

Updated 4 months ago

* * *

Did this page help you?

Yes

No
