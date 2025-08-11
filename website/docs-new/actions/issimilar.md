---
sidebar_position: 26
title: "IsSimilar"
description: "Compare string similarity using multiple algorithms and thresholds"
---

# IsSimilar

Calculates relative similarity between two strings using advanced distance algorithms. Returns truthy value if strings meet the similarity threshold, enabling fuzzy matching and content comparison.

## Syntax

```newo
IsSimilar(
  val1: str,
  val2: str,
  strategy: Literal['hamming', 'levenshtein', 'symbols'] = 'hamming',
  threshold: float = 0.4
)
```

## Parameters

### Required Parameters

- **`val1`** (string): First string to compare
- **`val2`** (string): Second string to compare

### Optional Parameters

- **`strategy`** (string): Comparison algorithm. Options:
  - `"hamming"` - Hamming distance (default)
  - `"levenshtein"` - Levenshtein distance
  - `"symbols"` - Exact match after symbol removal
- **`threshold`** (float): Similarity threshold (0.0-1.0, default: 0.4)

## Return Values

- **`"t"`** - Strings meet similarity threshold
- **`""`** (empty string) - Strings below similarity threshold

## How It Works

### Similarity Score Calculation
```
score = 1 - (distance / (len(val1) + len(val2)))
```

1. **Distance Calculation**: Uses selected algorithm to measure string differences
2. **Score Normalization**: Converts distance to similarity score (0.0-1.0)
3. **Threshold Comparison**: Returns "t" if score >= threshold
4. **Strategy Application**: Different algorithms for different use cases

### Algorithm Details

**Hamming Distance**: Character-by-character comparison (same length strings)
**Levenshtein Distance**: Minimum edits needed to transform one string to another
**Symbols Strategy**: Exact match after removing non-alphanumeric characters

## Use Cases

### Basic String Matching
```newo
{{!-- Simple similarity check --}}
{{Set(name="user_input", value="pizza")}}
{{Set(name="menu_item", value="piza")}}
{{#if IsSimilar(val1=user_input, val2=menu_item, threshold=0.6)}}
  {{SendMessage(message="Did you mean pizza?")}}
{{else}}
  {{SendMessage(message="Menu item not found")}}
{{/if}}
```

### User Intent Recognition
```newo
{{!-- Match user input to known intents --}}
{{Set(name="user_message", value=GetTriggeredAct())}}
{{#if IsSimilar(val1=user_message, val2="book appointment", threshold=0.7)}}
  {{SendMessage(message="I'll help you schedule an appointment")}}
  {{SetState(name="intent", value="booking")}}
{{else}}
  {{#if IsSimilar(val1=user_message, val2="cancel booking", threshold=0.7)}}
    {{SendMessage(message="I'll help you cancel your booking")}}
    {{SetState(name="intent", value="cancellation")}}
  {{else}}
    {{SendMessage(message="I'm not sure what you need. Could you be more specific?")}}
  {{/if}}
{{/if}}
```

### Fuzzy Search Implementation
```newo
{{!-- Search through menu items with fuzzy matching --}}
{{Set(name="search_term", value=GetTriggeredAct())}}
{{Set(name="menu_items", value=["hamburger", "cheeseburger", "pizza", "pasta", "salad"])}}
{{Set(name="matches", value="")}}

{{!-- Check each menu item --}}
{{#if IsSimilar(val1=search_term, val2="hamburger", threshold=0.5)}}
  {{Set(name="matches", value=Concat(matches, "hamburger, "))}}
{{/if}}
{{#if IsSimilar(val1=search_term, val2="cheeseburger", threshold=0.5)}}
  {{Set(name="matches", value=Concat(matches, "cheeseburger, "))}}
{{/if}}

{{#if IsEmpty(text=matches)}}
  {{SendMessage(message="No similar items found")}}
{{else}}
  {{SendMessage(message=Concat("Similar items: ", matches))}}
{{/if}}
```

### Data Validation and Cleanup
```newo
{{!-- Validate user input against expected values --}}
{{Set(name="user_choice", value=GetTriggeredAct())}}
{{Set(name="valid_options", value=["yes", "no", "maybe"])}}

{{Set(name="normalized_choice", value="")}}
{{#if IsSimilar(val1=user_choice, val2="yes", strategy="symbols")}}
  {{Set(name="normalized_choice", value="yes")}}
{{else}}
  {{#if IsSimilar(val1=user_choice, val2="no", strategy="symbols")}}
    {{Set(name="normalized_choice", value="no")}}
  {{else}}
    {{#if IsSimilar(val1=user_choice, val2="maybe", threshold=0.6)}}
      {{Set(name="normalized_choice", value="maybe")}}
    {{/if}}
  {{/if}}
{{/if}}

{{#if IsEmpty(text=normalized_choice)}}
  {{SendMessage(message="Please answer yes, no, or maybe")}}
{{else}}
  {{SendMessage(message=Concat("You selected: ", normalized_choice))}}
{{/if}}
```

## Advanced Patterns

### Multi-Strategy Comparison
```newo
{{!-- Try different strategies for best match --}}
{{Set(name="input", value="email address")}}
{{Set(name="target", value="e-mail")}}

{{!-- Try exact symbol match first --}}
{{#if IsSimilar(val1=input, val2=target, strategy="symbols")}}
  {{Set(name="match_type", value="exact")}}
{{else}}
  {{!-- Try fuzzy match --}}
  {{#if IsSimilar(val1=input, val2=target, strategy="levenshtein", threshold=0.6)}}
    {{Set(name="match_type", value="fuzzy")}}
  {{else}}
    {{Set(name="match_type", value="none")}}
  {{/if}}
{{/if}}

{{SendMessage(message=Concat("Match type: ", match_type))}}
```

### Similarity Scoring with Feedback
```newo
{{!-- Provide similarity confidence feedback --}}
{{Set(name="search_query", value="restrant")}}
{{Set(name="business_name", value="restaurant")}}

{{#if IsSimilar(val1=search_query, val2=business_name, threshold=0.9)}}
  {{SendMessage(message="Exact match found")}}
{{else}}
  {{#if IsSimilar(val1=search_query, val2=business_name, threshold=0.7)}}
    {{SendMessage(message="Close match - did you mean restaurant?")}}
  {{else}}
    {{#if IsSimilar(val1=search_query, val2=business_name, threshold=0.5)}}
      {{SendMessage(message="Possible match found")}}
    {{else}}
      {{SendMessage(message="No similar matches")}}
    {{/if}}
  {{/if}}
{{/if}}
```

### Dynamic Threshold Adjustment
```newo
{{!-- Adjust threshold based on input length --}}
{{Set(name="user_input", value=GetTriggeredAct())}}
{{Set(name="target_phrase", value="schedule appointment")}}

{{!-- Use higher threshold for longer phrases --}}
{{Set(name="input_length", value=Stringify(user_input))}}
{{#if IsSimilar(val1=input_length, val2="long_phrase", strategy="symbols")}}
  {{Set(name="threshold_value", value=0.8)}}
{{else}}
  {{Set(name="threshold_value", value=0.6)}}
{{/if}}

{{#if IsSimilar(val1=user_input, val2=target_phrase, threshold=threshold_value)}}
  {{SendMessage(message="Intent recognized with high confidence")}}
{{else}}
  {{SendMessage(message="Please clarify your request")}}
{{/if}}
```

## Integration Examples

### With Memory Analysis
```newo
{{!-- Compare current input with conversation history --}}
{{Set(name="current_input", value=GetTriggeredAct())}}
{{Set(name="last_message", value=GetMemory(count="1", fromPerson="User"))}}

{{#if IsSimilar(val1=current_input, val2=last_message, threshold=0.8)}}
  {{SendMessage(message="You mentioned something similar before. Let me help differently.")}}
{{else}}
  {{SendMessage(message="That's a new topic. Let me assist you.")}}
{{/if}}
```

### With State Management
```newo
{{!-- Track similar requests for analytics --}}
{{Set(name="current_request", value=GetTriggeredAct())}}
{{Set(name="previous_request", value=GetState(name="last_request"))}}

{{#if IsSimilar(val1=current_request, val2=previous_request, threshold=0.7)}}
  {{SetState(name="repeat_request_count", value="increment")}}
  {{SendMessage(message="I notice you're asking about something similar again.")}}
{{else}}
  {{SetState(name="last_request", value=current_request)}}
  {{SetState(name="repeat_request_count", value="0")}}
{{/if}}
```

### With AI Generation
```newo
{{!-- Use similarity to avoid repetitive responses --}}
{{Set(name="user_question", value=GetTriggeredAct())}}
{{Set(name="last_ai_response", value=GetState(name="previous_response"))}}

{{#system~}}
Answer this question: {{user_question}}
{{~/system}}

{{#assistant~}}
{{Gen(name="new_response")}}
{{~/assistant}}

{{#if IsSimilar(val1=new_response, val2=last_ai_response, threshold=0.8)}}
  {{#system~}}
  The previous response was too similar. Provide a completely different but helpful answer to: {{user_question}}
  {{~/system}}
  
  {{#assistant~}}
  {{Gen(name="alternative_response")}}
  {{~/assistant}}
  
  {{SendMessage(message=alternative_response)}}
{{else}}
  {{SendMessage(message=new_response)}}
{{/if}}

{{SetState(name="previous_response", value=new_response)}}
```

## Algorithm Examples

### Hamming Distance (Default)
```newo
{{!-- Best for same-length strings --}}
{{Set(name="code1", value="ABC123")}}
{{Set(name="code2", value="ABD123")}}
{{#if IsSimilar(val1=code1, val2=code2, strategy="hamming", threshold=0.8)}}
  {{SendMessage(message="Codes are very similar")}}
{{/if}}
```

### Levenshtein Distance
```newo
{{!-- Best for different-length strings --}}
{{Set(name="name1", value="Catherine")}}
{{Set(name="name2", value="Katherine")}}
{{#if IsSimilar(val1=name1, val2=name2, strategy="levenshtein", threshold=0.7)}}
  {{SendMessage(message="Names are similar")}}
{{/if}}
```

### Symbols Strategy
```newo
{{!-- Exact match after cleaning --}}
{{Set(name="messy1", value="  !!! e-mail@@ ")}}
{{Set(name="messy2", value="EMAIL")}}
{{#if IsSimilar(val1=messy1, val2=messy2, strategy="symbols")}}
  {{SendMessage(message="Exact match after cleanup")}}
{{/if}}
```

## Performance Optimization

### Strategy Selection Guide
- **Hamming**: Fast, same-length strings, character substitutions
- **Levenshtein**: Accurate, different lengths, insertions/deletions
- **Symbols**: Very fast, case/punctuation insensitive exact matching

### Threshold Tuning
```newo
{{!-- Different thresholds for different use cases --}}
{{!-- High precision: 0.8-0.9 --}}
{{!-- Balanced: 0.6-0.7 --}}
{{!-- High recall: 0.3-0.5 --}}
```

## Limitations

- **Performance**: Levenshtein can be slow with very long strings
- **Language Support**: ASCII/Unicode character handling varies
- **Context Unaware**: Doesn't understand semantic meaning
- **Threshold Sensitivity**: Optimal thresholds vary by use case
- **Memory Usage**: Large string comparisons consume more memory

## Related Actions

- [**IsEmpty**](./isempty) - Check for empty values
- [**IsGlobal**](./isglobal) - Check variable scope
- [**If**](./if) - Conditional logic based on similarity
- [**Set**](./set) - Store similarity results
- [**GetTriggeredAct**](./gettriggeredact) - Get user input for comparison
- [**Concat**](./concat) - Build comparison strings

## Performance Tips

- **Choose Right Strategy**: Match algorithm to use case
- **Optimize Thresholds**: Test different values for your data
- **Cache Results**: Store frequent comparisons
- **Preprocess Strings**: Clean inputs before comparison
- **Short-Circuit Logic**: Use multiple threshold levels