Concat

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Concat

Search

All

Pages

###### Start typing to search…

# Concat

The Concat action concatenates any number of string literals provided as arguments. The action accepts any number of arguments separated by a comma. An argument can be either a string literal (i.e., "my string literal") or an array of string literals (i.e., \["my literal 1", "my literal 2"\]).

If all of the arguments are strings, the Concat action returns a string. If any of the arguments is an array (\[...\]), the Concat action returns a string separated by the end of line symbol (/n).

```
Concat(
  str | [str] {, str | [str]}
)
```

### 

Example

[](#example)

Skill ScriptResponse

```
{{set(name="string_123", value=Concat("1", "2", "3"))}}

{{set(name="string_hamlet", value=Concat("to be", " ", ["or", "not to be"]))}}
 
{{SendMessage(message=string_123)}}
{{SendMessage(message=string_hamlet)}}
```

```
123
to be
or
not to be
```

  

Updated 4 months ago

* * *
