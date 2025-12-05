---
sidebar_position: 51
title: "SearchFuzzyAkb"
description: "Fuzzy search the Agent Knowledge Base for matching topics"
---

# SearchFuzzyAkb

Search the Agent Knowledge Base (AKB) using fuzzy matching to find relevant topics and information. Unlike exact matching, fuzzy search returns results that approximately match the query, making it ideal for handling typos, variations, and partial matches.

## Syntax

```newo
SearchFuzzyAkb(
  query: str,
  searchFields: List[str] = ["name"],
  fromPerson: Literal["Agent", "User", "Both"] = "Agent",
  numberTopics: int = 5
)
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query text to match against knowledge base |
| `searchFields` | array | No | `["name"]` | Fields to search within (e.g., "name", "content", "tags") |
| `fromPerson` | string | No | `"Agent"` | Source filter: "Agent", "User", or "Both" |
| `numberTopics` | int | No | `5` | Maximum number of results to return |

## Returns

- **array** - List of matching knowledge base topics with relevance scores

## How It Works

1. **Query Processing**: Analyzes the search query for fuzzy matching
2. **Field Selection**: Searches across specified fields in the knowledge base
3. **Fuzzy Matching**: Uses approximate string matching algorithms to find similar entries
4. **Source Filtering**: Filters results by the specified source (Agent/User/Both)
5. **Ranking**: Returns top matches sorted by relevance score
6. **Result Limiting**: Returns up to `numberTopics` results

## Basic Usage

### Simple Topic Search
```newo
{{!-- Search for topics related to a user query --}}
{{Set(name="search_results", value=SearchFuzzyAkb(
  query="how to book a table",
  numberTopics=3
))}}

{{#if not IsEmpty(text=search_results)}}
  {{SendMessage(message=Concat("I found information about: ", search_results[0].name))}}
{{else}}
  {{SendMessage(message="I couldn't find information about that topic.")}}
{{/if}}
```

### Search with Task ID
```newo
{{!-- Find task-related knowledge --}}
{{Set(name="task_knowledge", value=SearchFuzzyAkb(
  query=taskId,
  searchFields=["name"],
  fromPerson="Agent",
  numberTopics=1
))}}

{{#if not IsEmpty(text=task_knowledge)}}
  {{Set(name="task_context", value=task_knowledge[0].content)}}
{{/if}}
```

## Common Use Cases

### FAQ Lookup
```newo
{{!-- Find relevant FAQ entries for user question --}}
{{Set(name="user_question", value=GetMemory(count="1", fromPerson="User"))}}

{{Set(name="faq_matches", value=SearchFuzzyAkb(
  query=user_question,
  searchFields=["name", "content"],
  fromPerson="Agent",
  numberTopics=3
))}}

{{#if not IsEmpty(text=faq_matches)}}
  {{!-- Use best matching FAQ --}}
  {{Set(name="best_match", value=faq_matches[0])}}
  {{SendMessage(message=best_match.content)}}
{{else}}
  {{!-- Escalate if no FAQ found --}}
  {{SendMessage(message="Let me connect you with a specialist who can help.")}}
{{/if}}
```

### Product Information Search
```newo
{{!-- Search product knowledge base --}}
{{Set(name="product_query", value=GetState(name="user_product_interest"))}}

{{Set(name="product_info", value=SearchFuzzyAkb(
  query=product_query,
  searchFields=["name", "description", "category"],
  numberTopics=5
))}}

{{#if not IsEmpty(text=product_info)}}
  {{#system~}}
  Based on the customer's interest in "{{product_query}}", here are relevant products:
  {{Stringify(product_info)}}

  Provide a helpful response recommending the most relevant options.
  {{~/system}}

  {{#assistant~}}
  {{Gen(temperature=0.6)}}
  {{~/assistant}}
{{/if}}
```

### Contextual Help
```newo
{{!-- Provide contextual help based on current flow state --}}
{{Set(name="current_step", value=GetState(name="booking_step"))}}

{{Set(name="help_topics", value=SearchFuzzyAkb(
  query=Concat("help with ", current_step),
  searchFields=["name", "tags"],
  fromPerson="Agent",
  numberTopics=2
))}}

{{#if not IsEmpty(text=help_topics)}}
  {{SendMessage(message=Concat("Here's some help: ", help_topics[0].content))}}
{{/if}}
```

## Advanced Patterns

### Multi-Source Search
```newo
{{!-- Search both agent and user-contributed knowledge --}}
{{Set(name="combined_results", value=SearchFuzzyAkb(
  query=user_query,
  searchFields=["name", "content"],
  fromPerson="Both",
  numberTopics=10
))}}

{{!-- Separate by source --}}
{{Set(name="agent_results", value=CreateArray())}}
{{Set(name="user_results", value=CreateArray())}}

{% for result in combined_results %}
  {{#if IsSimilar(text1=result.source, text2="Agent")}}
    {{Set(name="agent_results", value=AppendItemsArrayJSON(
      jsonArray=agent_results,
      jsonItems=[result]
    ))}}
  {{else}}
    {{Set(name="user_results", value=AppendItemsArrayJSON(
      jsonArray=user_results,
      jsonItems=[result]
    ))}}
  {{/if}}
{% endfor %}
```

### Fallback Search Strategy
```newo
{{!-- Try specific search, then broaden if no results --}}
{{Set(name="specific_results", value=SearchFuzzyAkb(
  query=exact_query,
  searchFields=["name"],
  numberTopics=3
))}}

{{#if IsEmpty(text=specific_results)}}
  {{!-- Broaden search to more fields --}}
  {{Set(name="broad_results", value=SearchFuzzyAkb(
    query=exact_query,
    searchFields=["name", "content", "tags", "keywords"],
    fromPerson="Both",
    numberTopics=5
  ))}}
  {{Set(name="search_results", value=broad_results)}}
{{else}}
  {{Set(name="search_results", value=specific_results)}}
{{/if}}
```

### Knowledge-Enhanced AI Response
```newo
{{!-- Augment AI response with knowledge base context --}}
{{Set(name="user_question", value=GetMemory(count="1", fromPerson="User"))}}

{{Set(name="relevant_knowledge", value=SearchFuzzyAkb(
  query=user_question,
  searchFields=["name", "content"],
  numberTopics=3
))}}

{{#system~}}
You are a helpful assistant. Use the following knowledge base information to answer the customer's question.

Knowledge Base Context:
{{Stringify(relevant_knowledge)}}

Customer Question: "{{user_question}}"

Provide an accurate response based on the knowledge base. If the information isn't in the knowledge base, say you'll need to check with a specialist.
{{~/system}}

{{#assistant~}}
{{Gen(temperature=0.3, maxTokens=300)}}
{{~/assistant}}
```

## Search Optimization

### Effective Query Construction
```newo
{{!-- Clean and optimize search query --}}
{{Set(name="raw_query", value=GetMemory(count="1", fromPerson="User"))}}

{{!-- Remove common words that don't help search --}}
{{Set(name="clean_query", value=raw_query)}}

{{Set(name="results", value=SearchFuzzyAkb(
  query=clean_query,
  searchFields=["name", "tags"],
  numberTopics=5
))}}
```

### Result Ranking Integration
```newo
{{!-- Use search results with confidence filtering --}}
{{Set(name="all_results", value=SearchFuzzyAkb(
  query=user_query,
  numberTopics=10
))}}

{{!-- Filter by relevance score if available --}}
{{Set(name="high_confidence_results", value=CreateArray())}}

{% for result in all_results %}
  {{#if GreaterThan(a=result.score, b="0.7")}}
    {{Set(name="high_confidence_results", value=AppendItemsArrayJSON(
      jsonArray=high_confidence_results,
      jsonItems=[result]
    ))}}
  {{/if}}
{% endfor %}
```

## Best Practices

### 1. Use Appropriate Field Selection
```newo
{{!-- For title/name searches --}}
{{SearchFuzzyAkb(query=query, searchFields=["name"])}}

{{!-- For content searches --}}
{{SearchFuzzyAkb(query=query, searchFields=["content", "description"])}}

{{!-- For comprehensive searches --}}
{{SearchFuzzyAkb(query=query, searchFields=["name", "content", "tags", "keywords"])}}
```

### 2. Limit Results Appropriately
```newo
{{!-- For single best match --}}
{{SearchFuzzyAkb(query=query, numberTopics=1)}}

{{!-- For displaying options to user --}}
{{SearchFuzzyAkb(query=query, numberTopics=3)}}

{{!-- For comprehensive analysis --}}
{{SearchFuzzyAkb(query=query, numberTopics=10)}}
```

### 3. Handle Empty Results Gracefully
```newo
{{Set(name="results", value=SearchFuzzyAkb(query=user_query))}}

{{#if IsEmpty(text=results)}}
  {{!-- Provide helpful fallback --}}
  {{SendMessage(message="I don't have specific information about that. Would you like me to connect you with a specialist?")}}
{{else}}
  {{!-- Use results --}}
  {{SendMessage(message=results[0].content)}}
{{/if}}
```

## Limitations

- **Fuzzy Accuracy**: May return loosely related results for vague queries
- **Performance**: Large knowledge bases may have slower search times
- **Field Dependency**: Results quality depends on indexed field content
- **Score Interpretation**: Relevance scores may vary by knowledge base configuration

## Related Actions

- [**SetManualAkb**](./setmanualakb) - Add entries to knowledge base
- [**UpdateAkb**](./updateakb) - Update existing knowledge base entries
- [**DeleteAkb**](./deleteakb) - Remove knowledge base entries
- [**GetMemory**](./getmemory) - Access conversation context
- [**Gen**](./gen) - AI generation with knowledge context
