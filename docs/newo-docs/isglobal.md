IsGlobal

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

IsGlobal

Search

All

Pages

###### Start typing to search…

# IsGlobal

The IsGlobal action checks if the current skill is triggered in the global context. The global context meant that the flow instance does not belong to a specific user Persona and the flow instance belongs to the flow itself.

The action returns a “t” if the current flow is global, otherwise it returns “” (should be used as a "bool" value inside an IF statement).

```
{{#if IsGlobal()}}
{{!Process Global Event}}
{{#else}}
{{!Process user-persona-specific Event}}
{{~/if}}
```

  

Updated 4 months ago

* * *
