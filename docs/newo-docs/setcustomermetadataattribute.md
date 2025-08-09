SetCustomerMetadataAttribute

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

SetCustomerMetadataAttribute

Search

All

Pages

###### Start typing to search…

# SetCustomerMetadataAttribute

The SetCustomerMetadataAttribute aсtion sets a specific metadata value for a specific attribute. The attribute metadata can be set by providing the attribute's ID, field name, and value.

```
SetCustomerMetadataAttribute(
    idn: str,
    field: Literal["title", "description", "group", "is_hidden", "possible_values", "value_type"],
    value: Union[str, bool, List[Any]]
)
```

**Where:**

*   **idn:** The identifier of the attribute. For example, "customer\_last\_name."
*   **field:** The specific field you want to set.
*   **value:** Any value you want to set as the metadata of the attribute.

### 

Example

[](#example)

```
{{Set(name="my_attribute", value=SetCustomerMetadataAttribute(idn="project_attributes_restaurant_brunch_instruction", field="description", value="This is an attribute meta description."))}}
```

The above code snippet sets the customer attribute description of "project\_attributes\_restaurant\_brunch\_instruction."

Updated 4 months ago

* * *
