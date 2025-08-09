GetCustomerAttribute

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetCustomerAttribute

Search

All

Pages

###### Start typing to search…

# GetCustomerAttribute

The GetCustomerAttribute aсtion gets the value for a specific attribute.

```
GetCustomerAttribute(
    field: str
)
```

**Where:**

*   **field:** Specify the name of the attribute for which you would like to obtain the value.

### 

Example

[](#example)

```
{{Set(name="my_attribute", value=GetCustomerAttribute(field="project_attributes_restaurant_brunch_instruction"))}}
```

The above code snippet gets the customer attribute value of "project\_attributes\_restaurant\_brunch\_instruction."

Updated 4 months ago

* * *
