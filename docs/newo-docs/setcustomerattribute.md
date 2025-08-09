SetCustomerAttribute

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

SetCustomerAttribute

Search

All

Pages

###### Start typing to search…

# SetCustomerAttribute

The SetCustomerAttribute aсtion sets the value for a specific attribute.

```
SetCustomerAttribute(
    field: str,
    value: str
)
```

**Where:**

*   **field:** The name of the attribute you want to set.
*   **value:** Any attribute value you want to set.

### 

Example

[](#example)

```
{{Set(name="my_attribute", value=SetCustomerAttribute(field="project_attributes_restaurant_brunch_instruction", value="This is an instruction."))}}
```

The above code snippet sets the customer attribute value of "project\_attributes\_restaurant\_brunch\_instruction" to "This is an instruction."

Updated 4 months ago

* * *
