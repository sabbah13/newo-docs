---
sidebar_position: 10
title: "GetDateInterval"
description: "Calculate time interval between two datetime values"
---

# GetDateInterval

Calculate the time interval between two datetime values with configurable units.

## Syntax

```newo
GetDateInterval(
  dateFrom: str,
  dateTo: str,
  unit: Literal["second", "minute", "hour", "day", "month", "year"] = "second"
)
```

## Parameters

### Required Parameters

- **`dateFrom`** (string): The start date and time of the interval
- **`dateTo`** (string): The end date and time of the interval

### Optional Parameters

- **`unit`** (string): The unit for the result calculation. Options:
  - `"second"` (default): Returns interval in seconds
  - `"minute"`: Returns interval in minutes
  - `"hour"`: Returns interval in hours
  - `"day"`: Returns interval in days
  - `"month"`: Returns interval in months
  - `"year"`: Returns interval in years

## How It Works

1. **Date Parsing**: Converts the input datetime strings to datetime objects
2. **Interval Calculation**: Calculates the absolute difference between the two dates
3. **Unit Conversion**: Converts the result to the specified unit
4. **Return Value**: Returns the interval as a numeric value

## Use Cases

### Basic Time Measurement
```newo
{{!-- Calculate seconds between two specific times --}}
{{Set(name="start", value="2024-01-01T10:00:00")}}
{{Set(name="end", value="2024-01-01T10:05:30")}}
{{Set(name="seconds", value=GetDateInterval(
  dateFrom=start,
  dateTo=end,
  unit="second"
))}}
{{!-- Result: 330 (5 minutes 30 seconds) --}}
```

### Performance Monitoring
```newo
{{!-- Measure LLM generation time --}}
{{Set(name="start_time", value=GetDateTime(format="datetime"))}}

{{!-- Generate AI response --}}
{{Gen(name="response", temperature=0.7, prompt="Explain quantum computing")}}

{{Set(name="end_time", value=GetDateTime(format="datetime"))}}
{{Set(name="generation_time", value=GetDateInterval(
  dateFrom=start_time,
  dateTo=end_time,
  unit="second"
))}}

{{SendMessage(message=Concat(
  "Response generated in ", generation_time, " seconds"
))}}
```

### Session Duration Tracking
```newo
{{!-- Track conversation duration --}}
{{Set(name="session_start", value=GetState(name="conversation_started"))}}
{{Set(name="current_time", value=GetDateTime(format="datetime"))}}

{{Set(name="session_duration", value=GetDateInterval(
  dateFrom=session_start,
  dateTo=current_time,
  unit="minute"
))}}

{{#if GreaterThan(session_duration, 30)}}
  {{SendMessage(message="This conversation has been active for over 30 minutes.")}}
{{/if}}
```

### Different Time Units
```newo
{{!-- Calculate age in different units --}}
{{Set(name="birth_date", value="1990-05-15T00:00:00")}}
{{Set(name="current_date", value=GetDateTime(format="datetime"))}}

{{Set(name="age_years", value=GetDateInterval(
  dateFrom=birth_date,
  dateTo=current_date,
  unit="year"
))}}

{{Set(name="age_days", value=GetDateInterval(
  dateFrom=birth_date,
  dateTo=current_date,
  unit="day"
))}}

{{SendMessage(message=Concat(
  "Age: ", age_years, " years (", age_days, " days)"
))}}
```

### Business Hours Calculation
```newo
{{!-- Calculate business hours between dates --}}
{{Set(name="project_start", value="2024-01-01T09:00:00")}}
{{Set(name="project_end", value="2024-01-05T17:00:00")}}

{{Set(name="total_days", value=GetDateInterval(
  dateFrom=project_start,
  dateTo=project_end,
  unit="day"
))}}

{{Set(name="business_hours", value=Multiply(total_days, 8))}}
{{SendMessage(message=Concat(
  "Project duration: ", total_days, " days (", business_hours, " business hours)"
))}}
```

## Advanced Patterns

### Conditional Logic Based on Duration
```newo
{{!-- Handle different response times --}}
{{Set(name="request_start", value=GetState(name="last_request_time"))}}
{{Set(name="current_time", value=GetDateTime(format="datetime"))}}

{{Set(name="response_time", value=GetDateInterval(
  dateFrom=request_start,
  dateTo=current_time,
  unit="minute"
))}}

{{#if LessThan(response_time, 1)}}
  {{SendMessage(message="Quick response! Thanks for your patience.")}}
{{else if LessThan(response_time, 5)}}
  {{SendMessage(message="Sorry for the brief delay. How can I help?")}}
{{else}}
  {{SendMessage(message="Thank you for waiting. I'm ready to assist you now.")}}
{{/if}}
```

### Performance Benchmarking
```newo
{{!-- Benchmark different operations --}}
{{Set(name="operation_times", value=CreateArray())}}

{{Set(name="start1", value=GetDateTime(format="datetime"))}}
{{!-- Perform operation 1 --}}
{{SearchSemanticAKB(query="user question")}}
{{Set(name="end1", value=GetDateTime(format="datetime"))}}
{{Set(name="time1", value=GetDateInterval(dateFrom=start1, dateTo=end1, unit="second"))}}

{{Set(name="start2", value=GetDateTime(format="datetime"))}}
{{!-- Perform operation 2 --}}
{{SearchFuzzyAKB(query="user question")}}
{{Set(name="end2", value=GetDateTime(format="datetime"))}}
{{Set(name="time2", value=GetDateInterval(dateFrom=start2, dateTo=end2, unit="second"))}}

{{SendSystemEvent(eventIdn="performance_benchmark", 
  semantic_search_time=time1, 
  fuzzy_search_time=time2
)}}
```

## Limitations

- **Date Format**: Requires valid datetime strings in ISO format or compatible formats
- **Precision**: Limited by the underlying datetime parsing capabilities
- **Timezone**: Timezone handling depends on input format and system configuration
- **Large Intervals**: Very large intervals (decades/centuries) may have precision limitations
- **Unit Conversion**: Month and year calculations are approximate (30 days = month, 365 days = year)

## Troubleshooting

### Common Issues

**Invalid date format**:
```newo
{{!-- Validate date format before calculation --}}
{{#if IsEmpty(text=dateFrom)}}
  {{SendSystemEvent(eventIdn="error", message="Invalid start date format")}}
{{else}}
  {{GetDateInterval(dateFrom=dateFrom, dateTo=dateTo)}}
{{/if}}
```

**Negative intervals**:
```newo
{{!-- Handle cases where dateFrom is after dateTo --}}
{{Set(name="interval", value=GetDateInterval(dateFrom=start, dateTo=end))}}
{{#if LessThan(interval, 0)}}
  {{SendMessage(message="Start date is after end date")}}
{{/if}}
```

## Related Actions

- [**GetDateTime**](./getdatetime) - Get current or formatted datetime
- [**Set**](./set) - Store calculated intervals
- [**GetState**](./getstate) - Retrieve stored timestamps
- [**SendSystemEvent**](./sendsystemevent) - Log timing events
- [**If**](./if) - Conditional logic based on intervals
- [**Concat**](./concat) - Format interval messages

## Performance Tips

- **Cache Timestamps**: Store frequently used timestamps in state or AKB
- **Appropriate Units**: Choose the most appropriate unit for your use case
- **Validation**: Always validate input dates before calculation
- **Logging**: Use for performance monitoring and optimization