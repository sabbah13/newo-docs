# UpdateValueJSON

Updates the value of a specified key from a JSON object. If the key exists in the object, the associated value is updated.

```
UpdateValueJSON(
  obj: str, 
  key: str, 
  value: str
)
```

The example below replaces a value within an object that was specified by a key.

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
   value=UpdateValueJSON(
       obj='
           {
               "first_name": "Leonardo",
               "last_name": "DiCaprio"
           }',
       key="last_name",
       value='{
               "last_name": "da Vinci"
           }'
   )
)}}

{{SendMessage(message=LastName)}}
```

```
[{"first_name":"Brad","last_name":"Pitt"},{"first_name":"Matt","last_name":"Damon"},{"first_name":"Leonardo","last_name":"DiCaprio"},{"first_name":"Robert","last_name":"De Niro"}]

{"first_name":"Leonardo","last_name":{"last_name":"da Vinci"}}
```

  

Updated 4 months ago

* * *
