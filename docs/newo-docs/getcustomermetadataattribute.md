GetCustomerMetadataAttribute

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GetCustomerMetadataAttribute

Search

All

Pages

###### Start typing to search…

# GetCustomerMetadataAttribute

The GetCustomerMetadataAttribute aсtion retrieves a specific metadata value for a specific attribute. The attribute metadata can be obtained by passing the attribute ID. You can retrieve the desired field using its name in the field parameter.

```
GetCustomerMetadataAttribute(
    idn: str,
    field: Literal["title", "description", "group", "is_hidden", "possible_values", "value_type"]
)
```

**Where:**

*   **idn:** The identifier of the attribute. For example, "customer\_last\_name."
*   **field:** The specific field you want to retrieve.

### 

Example

[](#example)

```
{{Set(name="my_attribute", value=GetCustomerMetadataAttribute(idn="project_attributes_restaurant_brunch_instruction", field="description"))}}
```

The above code snippet gets the customer attribute description of "project\_attributes\_restaurant\_brunch\_instruction." If no description was set for this attribute, the result will return null.

Updated 4 months ago

* * *
