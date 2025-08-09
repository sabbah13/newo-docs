Stringify

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Stringify

Search

All

Pages

###### Start typing to search…

# Stringify

The Stringify action removes quotes from a string. This action also supports JSON strings. Here are just two scenarios where this action could come in useful:

*   **Logging or Display Purposes:** Stripping quotes could be for aesthetic reasons, which is particularly useful when wanting to display data in an email or SMS where seeing extra quotes might be confusing or undesirable.
*   **Data Cleanup:** In some cases, it may be necessary to clean or normalize string data, removing any enclosing quotes to avoid interfering with further data processing or comparisons.

```
Stringify(
  str
)
```

### 

Example 1 (Basic)

[](#example-1-basic)

The example below uses the Stringify action to remove quotes from a string. The result is sent to the Sandbox chat.

Skill ScriptResponse

```
{{set(name="output", value=Stringify("This is a basic test"))}}

{{SendMessage(message=output)}}
```

```
This is a basic test
```

### 

Example 2 (JSON)

[](#example-2-json)

The example below shows the functionality of the Stringify action with a JSON value. Without the Stringify action, the result would return "DiCaprio."

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

{{set(
   name="LastName",
   value=Stringify(GetValueJSON(
       obj='
           {
               "first_name": "Leonardo",
               "last_name": "DiCaprio"
           }',
       key="last_name"
       )
    )
)}}

{{SendMessage(message=LastName)}}
```

```
DiCaprio
```

Updated 4 months ago

* * *
