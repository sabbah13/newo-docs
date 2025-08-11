---
sidebar_position: 29
title: "Summarize"
description: "Create concise summaries of text content with length control"
---

# Summarize

Creates concise summaries of input text with customizable length limits. Uses AI-powered summarization to extract key information and main points from longer content.

## Syntax

```newo
Summarize(
  inputText: str,
  maxLen: str
)
```

## Parameters

### Required Parameters

- **`inputText`** (string): The text content to summarize
- **`maxLen`** (string): Maximum length for the summary
  - Numeric values (e.g., "200", "500")
  - Relative lengths (e.g., "short", "medium", "long")
  - Word counts (e.g., "50 words", "100 words")

## Return Values

- **Summary text**: Condensed version of input content
- **Formatted output**: Summary respecting length constraints
- **Key points**: Main ideas extracted from original text

## How It Works

1. **Text Analysis**: Processes input content for key information
2. **Length Calculation**: Determines target summary length
3. **Content Extraction**: Identifies most important points and themes
4. **Summary Generation**: Creates concise version maintaining core meaning
5. **Length Enforcement**: Ensures output meets specified constraints

## Use Cases

### Conversation History Summaries
```newo
{{!-- Summarize recent conversation --}}
{{Set(name="conversation", value=GetMemory(count="10", maxLen="5000"))}}
{{Set(name="summary", value=Summarize(
  inputText=conversation,
  maxLen="200"
))}}
{{SendMessage(message=Concat("Conversation summary: ", summary))}}
```

### Long Content Processing
```newo
{{!-- Summarize user-provided long text --}}
{{Set(name="user_content", value=GetTriggeredAct())}}
{{#if IsSimilar(text1=Stringify(user_content), text2="long_text", threshold=0.3)}}
  {{Set(name="brief_summary", value=Summarize(
    inputText=user_content,
    maxLen="100"
  ))}}
  {{SendMessage(message=Concat("Here's a brief summary: ", brief_summary))}}
{{else}}
  {{SendMessage(message="Content is already concise enough")}}
{{/if}}
```

### Email/Document Processing
```newo
{{!-- Process external document content --}}
{{Set(name="document_content", value=SendCommand(command="fetch_document"))}}
{{Set(name="executive_summary", value=Summarize(
  inputText=document_content,
  maxLen="300"
))}}
{{SendMessage(message=Concat("Document Summary: ", executive_summary))}}
```

### Meeting Notes Condensation
```newo
{{!-- Create meeting highlights --}}
{{Set(name="meeting_transcript", value=GetState(name="meeting_notes"))}}
{{Set(name="key_points", value=Summarize(
  inputText=meeting_transcript,
  maxLen="250"
))}}
{{SetState(name="meeting_summary", value=key_points)}}
{{SendMessage(message=Concat("Meeting highlights: ", key_points))}}
```

## Advanced Patterns

### Multi-Length Summaries
```newo
{{!-- Generate different summary lengths --}}
{{Set(name="full_content", value=GetMemory(count="20", maxLen="10000"))}}

{{Set(name="brief_summary", value=Summarize(
  inputText=full_content,
  maxLen="50"
))}}

{{Set(name="detailed_summary", value=Summarize(
  inputText=full_content,
  maxLen="200"
))}}

{{SendMessage(message=Concat("Brief: ", brief_summary))}}
{{SendMessage(message=Concat("Detailed: ", detailed_summary))}}
```

### Contextual Summarization
```newo
{{!-- Summarize with context awareness --}}
{{Set(name="user_query", value=GetTriggeredAct())}}
{{Set(name="conversation_history", value=GetMemory(count="15"))}}

{{Set(name="context_summary", value=Summarize(
  inputText=Concat("User asked: ", user_query, " Context: ", conversation_history),
  maxLen="150"
))}}

{{#system~}}
Based on this summary, provide a helpful response: {{context_summary}}
{{~/system}}

{{#assistant~}}
{{Gen(name="contextual_response")}}
{{~/assistant}}

{{SendMessage(message=contextual_response)}}
```

### Incremental Summarization
```newo
{{!-- Build cumulative summaries --}}
{{Set(name="existing_summary", value=GetState(name="session_summary"))}}
{{Set(name="new_content", value=GetMemory(count="3", fromPerson="User"))}}

{{#if IsEmpty(text=existing_summary)}}
  {{Set(name="updated_summary", value=Summarize(
    inputText=new_content,
    maxLen="200"
  ))}}
{{else}}
  {{Set(name="combined_content", value=Concat(existing_summary, " NEW: ", new_content))}}
  {{Set(name="updated_summary", value=Summarize(
    inputText=combined_content,
    maxLen="200"
  ))}}
{{/if}}

{{SetState(name="session_summary", value=updated_summary)}}
```

### Topic-Focused Summarization
```newo
{{!-- Summarize with specific focus --}}
{{Set(name="discussion_content", value=GetMemory(count="12"))}}
{{Set(name="focus_area", value=GetState(name="current_topic"))}}

{{Set(name="focused_summary", value=Summarize(
  inputText=Concat("Focus on ", focus_area, " in this content: ", discussion_content),
  maxLen="180"
))}}

{{SendMessage(message=Concat("Summary focused on ", focus_area, ": ", focused_summary))}}
```

## Integration Examples

### With Knowledge Base Storage
```newo
{{!-- Store summaries in knowledge base --}}
{{Set(name="long_interaction", value=GetMemory(count="25"))}}
{{Set(name="interaction_summary", value=Summarize(
  inputText=long_interaction,
  maxLen="300"
))}}

{{SetAKB(
  key=Concat("interaction_", GetDateTime(format="date"), "_", GetUser(field="id")),
  value=interaction_summary
)}}

{{SendMessage(message="Your interaction has been summarized and saved")}}
```

### With External Systems
```newo
{{!-- Send summaries to external platforms --}}
{{Set(name="session_content", value=GetMemory(count="30"))}}
{{Set(name="report_summary", value=Summarize(
  inputText=session_content,
  maxLen="400"
))}}

{{SendCommand(
  command="create_report",
  summary=report_summary,
  user_id=GetUser(field="id"),
  timestamp=GetDateTime()
)}}
```

### With AI Enhancement
```newo
{{!-- Enhance summaries with AI analysis --}}
{{Set(name="raw_content", value=GetMemory(count="15"))}}
{{Set(name="basic_summary", value=Summarize(
  inputText=raw_content,
  maxLen="200"
))}}

{{#system~}}
Enhance this summary with key insights and actionable items:
{{basic_summary}}

Provide enhanced summary with insights and next steps.
{{~/system}}

{{#assistant~}}
{{Gen(name="enhanced_summary", maxTokens=300)}}
{{~/assistant}}

{{SendMessage(message=enhanced_summary)}}
```

## Length Control Options

### Numeric Lengths
```newo
{{!-- Specific character/word counts --}}
{{Summarize(inputText=content, maxLen="100")}}    {{!-- 100 characters --}}
{{Summarize(inputText=content, maxLen="50 words")}} {{!-- 50 words --}}
```

### Relative Lengths
```newo
{{!-- Descriptive length indicators --}}
{{Summarize(inputText=content, maxLen="short")}}   {{!-- Brief summary --}}
{{Summarize(inputText=content, maxLen="medium")}}  {{!-- Moderate length --}}
{{Summarize(inputText=content, maxLen="long")}}    {{!-- Detailed summary --}}
```

### Percentage-Based
```newo
{{!-- Relative to original content --}}
{{Summarize(inputText=content, maxLen="25%")}}     {{!-- Quarter of original --}}
{{Summarize(inputText=content, maxLen="50%")}}     {{!-- Half of original --}}
```

## Quality Optimization

### Content Preparation
```newo
{{!-- Clean content before summarization --}}
{{Set(name="raw_content", value=GetMemory(count="20"))}}
{{Set(name="clean_content", value=Stringify(raw_content))}}
{{Set(name="quality_summary", value=Summarize(
  inputText=clean_content,
  maxLen="250"
))}}
```

### Summary Validation
```newo
{{!-- Validate summary quality --}}
{{Set(name="content", value=GetTriggeredAct())}}
{{Set(name="summary", value=Summarize(inputText=content, maxLen="150"))}}

{{#if IsEmpty(text=summary)}}
  {{SendMessage(message="Unable to generate summary. Content may be too short.")}}
{{else}}
  {{#if IsSimilar(text1=summary, text2=content, threshold=0.9)}}
    {{SendMessage(message="Content is already concise")}}
  {{else}}
    {{SendMessage(message=Concat("Summary: ", summary))}}
  {{/if}}
{{/if}}
```

## Error Handling

### Input Validation
```newo
{{!-- Handle empty or invalid input --}}
{{Set(name="input_content", value=GetTriggeredAct())}}
{{#if IsEmpty(text=input_content)}}
  {{SendMessage(message="Please provide content to summarize")}}
{{else}}
  {{Set(name="result_summary", value=Summarize(
    inputText=input_content,
    maxLen="200"
  ))}}
  {{#if IsEmpty(text=result_summary)}}
    {{SendMessage(message="Content is too short to summarize effectively")}}
  {{else}}
    {{SendMessage(message=result_summary)}}
  {{/if}}
{{/if}}
```

### Length Adjustment
```newo
{{!-- Adjust length based on content size --}}
{{Set(name="source_content", value=GetMemory(count="10"))}}
{{Set(name="content_length", value=Stringify(source_content))}}

{{!-- Determine appropriate summary length --}}
{{#if IsSimilar(text1=content_length, text2="very_long", threshold=0.3)}}
  {{Set(name="target_length", value="400")}}
{{else}}
  {{Set(name="target_length", value="150")}}
{{/if}}

{{Set(name="adaptive_summary", value=Summarize(
  inputText=source_content,
  maxLen=target_length
))}}
```

## Performance Considerations

### Content Size Management
- **Large Content**: Break into chunks for processing
- **Small Content**: May not require summarization
- **Optimal Range**: 500-5000 characters work best

### Length Selection
- **Too Short**: May lose important details
- **Too Long**: Defeats summarization purpose
- **Sweet Spot**: 20-30% of original length

## Limitations

- **Language Dependency**: Works best with well-structured text
- **Context Loss**: May lose subtle nuances or context
- **Length Accuracy**: Output length may vary from specified maximum
- **Content Type**: Best suited for prose, less effective with data tables
- **Processing Time**: Longer content takes more time to summarize

## Related Actions

- [**GetMemory**](./getmemory) - Source conversation content
- [**Concat**](./concat) - Combine content before summarization
- [**Stringify**](./stringify) - Clean content for better processing
- [**SetState**](./setstate) - Store summaries for later use
- [**SendMessage**](./sendmessage) - Deliver summary results
- [**Gen**](./gen) - AI enhancement of summaries

## Performance Tips

- **Optimal Input Size**: 500-5000 characters for best results
- **Pre-process Content**: Clean and format input text
- **Cache Summaries**: Store frequently accessed summaries
- **Batch Processing**: Summarize related content together
- **Length Strategy**: Choose appropriate length for use case