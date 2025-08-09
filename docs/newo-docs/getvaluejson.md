GetValueJSON

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetValueJSON

Search

All

Pages

###### Start typing to search…

# GetValueJSON

Extracts the value of a specified key from a JSON object. If the key exists in the object, the associated value is returned.

```
GetValueJSON(
  obj: str, 
  key: str
)
```

#### 

Where:

[](#where)

*   **obj:** An array in the format '\[{"first\_name": "Brad", "last\_name": "Pitt"}\]\[{"first\_name": "Brad", "last\_name": "Pitt"}\]' for example.
*   **key:** A string or list of strings representing a numerical value indicating the position of an element in an array.

### 

Example

[](#example)

The example below searches within the JSON object for the specified key and displays the result in the Sandbox chat.

Skill ScriptResponse

```
{{set(
   name="MyArray",
   value=AppendItemsArrayJSON(
       array="[]",
       items=[
           '{
               "first_name": "Brad",
               "last_name": "Pitt"
           }',
           '{
               "first_name": "Matt",
               "last_name": "Damon"
           }',
          '{
               "first_name": "Leonardo",
               "last_name": "DiCaprio"
           }',
           '{
               "first_name": "Robert",
               "last_name": "De Niro"
           }'
       ]
   )
)}}

{{SendMessage(message=MyArray)}}

{{set(
   name="LastName",
   value=GetValueJSON(
       obj='
           {
               "first_name": "Leonardo",
               "last_name": "DiCaprio"
           }',
       key="last_name"
   )
)}}

{{SendMessage(message=LastName)}}
```

```
[\{"first_name":"Brad","last_name":"Pitt"},{"first_name":"Matt","last_name":"Damon"},\{"first_name":"Leonardo","last_name":"DiCaprio"},\{"first_name":"Robert","last_name":"De Niro"}]

"DiCaprio"
```

Updated 4 months ago

* * *
