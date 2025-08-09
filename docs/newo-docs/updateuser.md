UpdateUser

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

UpdateUser

Search

All

Pages

###### Start typing to search…

# UpdateUser

The UpdateUser action updates a specific field (name) of a user with a new value. The name parameter must be one of the predefined options ("title", "description", "name"), and the value is the string representing the new data to set for that field.

```
UpdateUser(
  name: str, 
  value: str
)
```

#### 

Where:

[](#where)

*   **name:** Literal\["title", "description", "name"\].
*   **value:** New string value to replace the existing string.

Updated 4 months ago

* * *
