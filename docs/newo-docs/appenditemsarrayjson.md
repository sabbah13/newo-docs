AppendItemsArrayJSON

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

AppendItemsArrayJSON

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# AppendItemsArrayJSON

Appends new elements to an array.

`AppendItemsArrayJSON(   array: str,    items: str | list[str] )`

#### 

Where:

[](#where)

*   **array:** An array in the format "\[\]" (an empty array) or '\[{"first\_name": "Brad", "last\_name": "Pitt"}\]\[{"first\_name": "Brad", "last\_name": "Pitt"}\]' for example.
*   **items:** A string or list of strings in the format \[{"first\_name": "Brad", "last\_name": "Pitt"}\]\[{"first\_name": "Brad", "last\_name": "Pitt"}\] for example.

### 

Example

[](#example)

The example below appends two sets of elements to an empty array and displays the result in the Sandbox chat.

Skill ScriptResponse

`   {{set(    name="MyArray",    value=AppendItemsArrayJSON(        array="[]",        items=[            '{                "first_name": "Brad",                "last_name": "Pitt"            }',            '{                "first_name": "Matt",                "last_name": "Damon"            }'        ]    ) )}}  {{SendMessage(message=MyArray)}}  {{set(    name="MyArray",    value=AppendItemsArrayJSON(        array=MyArray,        items=[            '{                "first_name": "Leonardo",                "last_name": "DiCaprio"            }',            '{                "first_name": "Robert",                "last_name": "De Niro"            }'        ]    ) )}}  {{SendMessage(message=MyArray)}}   `

`   [\{"first_name":"Brad","last_name":"Pitt"},\{"first_name":"Matt","last_name":"Damon"}]  [\{"first_name":"Brad","last_name":"Pitt"},\{"first_name":"Matt","last_name":"Damon"},\{"first_name":"Leonardo","last_name":"DiCaprio"},\{"first_name":"Robert","last_name":"De Niro"}]   `

Updated 4 months ago

* * *

Did this page help you?

Yes

No
