SearchFuzzyAkb

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

SearchFuzzyAkb

Search

All

Pages

###### Start typing to search…

# SearchFuzzyAkb

Searches the Active Knowledge Base based on a query and returns the appropriate specified field (or best-match).

```
SearchFuzzyAkb(
  query: str,  
  searchFields: List[str] | None = None,  
  fromPerson: Literal["Agent", "User", "Both"] = "Both",  
  numberTopics: int = 1,
  fields: List[str] | None = None,  
  labels: List[str] | None = None,
  filterByUserPersonaIds: str
)
```

#### 

Where:

[](#where)

*   **query:** The string used to search the AKB for a best-match topic.
*   **searchFields:** \["name", "summary", "facts"\]. You can specify one or more fields separated by commas. In this parameter, we specify the fields through which the search will be conducted.
*   **fromPerson:** Literal\["Agent", "User", "Both"\]. This parameter indicates whose topics to search for.
*   **numberTopics:** The maximum number of topics returned.
*   **fields:** \["id", "personId", "topicId", "topic", "summary", "facts", "confidence", "source", "createdAt", "updatedAt", "labels"\]. You can specify one or more fields separated by commas. In this parameter, we specify which fields of the topic should be returned. The fields of each found topic are returned in the format:
    *   Id\\nperson\_id\\ntopic\_id\\ntopic\\nsummary\\nfacts\\nconfidence\\nsource\\ncreated\_at\\nupdated\_at\\nlabels\\n\\nId\\nperson\_id\\ntopic\_id\\ntopic\\nsummary\\nfacts\\nconfidence\\nsource\\ncreated\_at\\nupdated\_at\\nlabels...
*   **labels:** The labels associated with the AKB topics you'd like to search in.
*   **filterByUserPersonaIds:** Filters the results based on Persona IDs and shows only those results.

If persona IDs are explicitly provided from arguments, they will be used. Else, the flow context will be used.

Search results are sorted by the degree of similarity between the query and the field value from searchFields. The best matches are at the top of the search results list.

Updated 4 months ago

* * *
