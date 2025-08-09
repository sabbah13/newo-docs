GetRandomChoice

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetRandomChoice

Search

All

Pages

###### Start typing to search…

# GetRandomChoice

The GetRandomChoice action randomly selects between any number of string literals provided as arguments. The action accepts any number of arguments separated by a comma. An argument can be either a string literal (e.g., "my string literal") or an array of string literals (e.g., \["my literal 1", "my literal 2"\]). You need to specify at least one argument for this action.

```
GetRandomChoice(
  str | [str] {, str | [str]}
)
```

### 

Example

[](#example)

Skill ScriptRandom Response

```
{{set(name="random_number", value=GetRandomChoice("1", "2", "3"))}}
{{set(name="random_hamlet", value=GetRandomChoice(["to be", "not to be"]))}}
{{set(name="random_response", value=GetRandomChoice("yes", "no", ["maybe", "dunno", "no idea, man"]))}}
 
{{SendMessage(message=random_number)}}
{{SendMessage(message=random_hamlet)}}
{{SendMessage(message=random_response)}}
```

```
2
to be
yes
```

Updated 4 months ago

* * *
