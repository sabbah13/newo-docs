# ReplaceItemsArrayByIndexesJSON

Replaces an element within an array at a specific index, a numerical value that indicates the position of the element, starting from zero where the first item is accessed with an index of 0, the second with 1, and so on.

```
ReplaceItemsArrayByIndexesJSON(
  array: str, 
  indexes: str | list[str], 
  item: str
)
```

*   **array:** An array in the format '\[{"first\_name": "Brad", "last\_name": "Pitt"}\]\[{"first\_name": "Brad", "last\_name": "Pitt"}\]' for example.
*   **indexes:** A string or list of strings representing a numerical value indicating the position of an element in an array.
*   **item:** A string to replace within the array at the specified index.

The example below finds the first element in an array, replaces it with another element, and displays the new array in the Sandbox chat.

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
   name="MyArray",
   value=ReplaceItemsArrayByIndexesJSON(
       array=MyArray,
       indexes="0",
       item="Angelina Jolie"
   )
)}}

{{SendMessage(message=MyArray)}}
```

```
[\{"first_name":"Brad","last_name":"Pitt"},\{"first_name":"Matt","last_name":"Damon"},\{"first_name":"Leonardo","last_name":"DiCaprio"},\{"first_name":"Robert","last_name":"De Niro"}]

["Angelina Jolie",\{"first_name":"Matt","last_name":"Damon"},\{"first_name":"Leonardo","last_name":"DiCaprio"},\{"first_name":"Robert","last_name":"De Niro"}]
```

  

Updated 4 months ago

* * *
