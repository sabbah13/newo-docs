---
sidebar_position: 15
title: "Concat"
description: "Concatenate multiple strings and arrays into single text output"
---

# Concat

Concatenates multiple string literals, variables, and arrays into a single string output. Handles mixed string and array inputs with intelligent formatting.

## Syntax

```newo
Concat(
  str | [str] {, str | [str]}
)
```

## Parameters

### Variable Parameters

- **Arguments** (string | array): Any number of string literals or string arrays
  - **String arguments**: Concatenated directly
  - **Array arguments**: Items joined with newlines (`\n`)
  - **Mixed inputs**: Strings and arrays combined intelligently

## Return Values

- **String result**: All arguments combined into single string
- **Newline separation**: Array elements separated by `\n`
- **Direct concatenation**: String arguments joined without separators

## How It Works

1. **Input Processing**: Evaluates each argument as string or array
2. **String Handling**: Direct concatenation for string arguments
3. **Array Handling**: Joins array elements with newlines
4. **Mixed Processing**: Combines strings and arrays with appropriate formatting
5. **Output Generation**: Returns final concatenated result

## Use Cases

### Basic String Concatenation
```newo
{{!-- Simple string joining --}}
{{Set(name="greeting", value=Concat("Hello, ", GetUser(field="name"), "!"))}}
{{SendMessage(message=greeting)}}

{{!-- Build dynamic messages --}}
{{Set(name="status", value=Concat("Order #", orderNumber, " is ", status))}}
```

### User Data Integration
```newo
{{!-- Personal message construction --}}
{{Set(name="user_name", value=GetUser(field="name"))}}
{{Set(name="user_email", value=GetUser(field="email"))}}
{{Set(name="welcome_msg", value=Concat(
  "Welcome ", user_name, "! ",
  "Your account ", user_email, " is now active."
))}}
{{SendMessage(message=welcome_msg)}}
```

### Array Formatting
```newo
{{!-- List generation with arrays --}}
{{Set(name="menu_items", value=Concat("Today's menu:", ["Pizza", "Burgers", "Salads"]))}}
{{SendMessage(message=menu_items)}}
{{!-- Result:
Today's menu:
Pizza
Burgers
Salads
--}}
```

### Mixed Content Formatting
```newo
{{!-- Combine strings and arrays --}}
{{Set(name="order_summary", value=Concat(
  "Order Summary for ", GetUser(field="name"), ":",
  ["Item 1: Pizza - $12.99", "Item 2: Drink - $2.99"],
  "Total: $15.98"
))}}
{{SendMessage(message=order_summary)}}
```

## Advanced Patterns

### Dynamic Content Building
```newo
{{!-- Build complex messages with state data --}}
{{Set(name="booking_date", value=GetState(name="selected_date"))}}
{{Set(name="booking_time", value=GetState(name="selected_time"))}}
{{Set(name="service_type", value=GetState(name="service"))}}

{{Set(name="confirmation", value=Concat(
  "Booking Confirmation",
  "Service: ", service_type,
  "Date: ", booking_date,
  "Time: ", booking_time,
  "Thank you for choosing our service!"
))}}
```

### Multi-Language Support
```newo
{{!-- Language-specific concatenation --}}
{{Set(name="user_lang", value=GetUser(field="language"))}}
{{#if IsSimilar(text1=user_lang, text2="es")}}
  {{Set(name="greeting", value=Concat("¡Hola, ", GetUser(field="name"), "!"))}}
{{else}}
  {{Set(name="greeting", value=Concat("Hello, ", GetUser(field="name"), "!"))}}
{{/if}}
```

### Report Generation
```newo
{{!-- Generate formatted reports --}}
{{Set(name="report_header", value=Concat(
  "Daily Report - ", GetDateTime(format="date"),
  "Generated at: ", GetDateTime(format="time")
))}}

{{Set(name="metrics", value=Concat(
  "Performance Metrics:",
  ["Total Orders: 45", "Revenue: $1,250.00", "Customer Satisfaction: 98%"]
))}}

{{Set(name="full_report", value=Concat(report_header, metrics))}}
```

### Error Message Building
```newo
{{!-- Construct detailed error messages --}}
{{Set(name="error_details", value=Concat(
  "Validation Error:",
  "Missing required fields:",
  missing_fields,
  "Please complete all required information."
))}}
{{SendMessage(message=error_details)}}
```

### Template Processing
```newo
{{!-- Build templates with placeholders --}}
{{Set(name="email_template", value=Concat(
  "Dear ", GetUser(field="name"), ",",
  "Your appointment on ", appointment_date, " has been confirmed.",
  "Location: ", appointment_location,
  "Please arrive 15 minutes early."
))}}
```

## Integration Examples

### With AI Generation
```newo
{{!-- Combine user input with AI response --}}
{{#system~}}
Respond to this user query: {{userInput}}
{{~/system}}

{{#assistant~}}
{{Gen(name="ai_response")}}
{{~/assistant}}

{{Set(name="full_response", value=Concat(
  "Based on your question: '", userInput, "'",
  "Here's my response: ", ai_response
))}}
```

### With State Management
```newo
{{!-- Build state-aware messages --}}
{{Set(name="current_step", value=GetState(name="workflow_step"))}}
{{Set(name="total_steps", value=GetState(name="total_steps"))}}

{{Set(name="progress_msg", value=Concat(
  "Step ", current_step, " of ", total_steps,
  " - ", GetState(name="step_description")
))}}
```

### With External Data
```newo
{{!-- Combine API responses --}}
{{Set(name="weather_data", value=SendCommand(command="get_weather"))}}
{{Set(name="weather_report", value=Concat(
  "Current weather in ", GetUser(field="city"), ":",
  weather_data,
  "Have a great day!"
))}}
```

## Formatting Examples

### List Building
```newo
{{Set(name="shopping_list", value=Concat("Shopping List:", ["Milk", "Bread", "Eggs"]))}}
{{!-- Result:
Shopping List:
Milk
Bread
Eggs
--}}
```

### Multi-Section Content
```newo
{{Set(name="newsletter", value=Concat(
  "Weekly Newsletter",
  "Top Stories:",
  ["AI Breakthrough", "Market Update", "Tech News"],
  "Weather: Sunny, 75°F"
))}}
```

### Data Presentation
```newo
{{Set(name="user_profile", value=Concat(
  "Profile Information:",
  ["Name: " + GetUser(field="name"), "Email: " + GetUser(field="email")],
  "Last login: ", GetState(name="last_login")
))}}
```

## Limitations

- **No Built-in Separators**: Must manually add spaces, punctuation
- **Array Newlines**: Arrays always use newline separators
- **Type Conversion**: All inputs converted to strings
- **Memory Usage**: Large concatenations consume more memory
- **No Formatting**: No built-in number or date formatting

## Troubleshooting

### Common Issues

**Missing spaces between words**:
```newo
{{!-- Incorrect: words run together --}}
{{Set(name="bad_concat", value=Concat("Hello", "World"))}}

{{!-- Correct: add explicit spaces --}}
{{Set(name="good_concat", value=Concat("Hello", " ", "World"))}}
```

**Handling empty values**:
```newo
{{!-- Check for empty values before concatenating --}}
{{Set(name="middle_name", value=GetUser(field="middle_name"))}}
{{#if IsEmpty(text=middle_name)}}
  {{Set(name="full_name", value=Concat(first_name, " ", last_name))}}
{{else}}
  {{Set(name="full_name", value=Concat(first_name, " ", middle_name, " ", last_name))}}
{{/if}}
```

## Related Actions

- [**Set**](./set) - Assign concatenated results to variables
- [**Stringify**](./stringify) - Convert other types to strings
- [**SendMessage**](./sendmessage) - Send concatenated messages
- [**GetUser**](./getuser) - Get user data for concatenation

## Performance Tips

- **Batch Operations**: Combine multiple Concat calls when possible
- **Cache Results**: Store frequently used concatenations
- **Check Lengths**: Validate input lengths for large concatenations
- **Use Variables**: Store intermediate results for complex builds