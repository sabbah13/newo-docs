---
sidebar_position: 62
title: "SetManualAkb"
description: "Manually add entries to the Agent Knowledge Base"
---

# SetManualAkb

Manually add entries to the Agent Knowledge Base (AKB). This action creates new knowledge base entries with explicit content, useful for adding structured information, FAQs, or domain-specific knowledge.

## Syntax

```newo
SetManualAkb(
  name: str,
  content: str,
  category: str = None,
  tags: List[str] = None,
  metadata: dict = None
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Name/title for the knowledge entry |
| `content` | string | Yes | The knowledge content to store |
| `category` | string | No | Category for organization |
| `tags` | array | No | Tags for searchability |
| `metadata` | dict | No | Additional metadata |

## Returns

- **object** - Created knowledge base entry with ID

## Basic Usage

### Add Simple Entry
```newo
{{!-- Add a simple FAQ entry --}}
{{SetManualAkb(
  name="Business Hours",
  content="We are open Monday through Friday, 9 AM to 5 PM EST. Closed on weekends and major holidays."
)}}
```

### Add Categorized Entry
```newo
{{!-- Add categorized knowledge --}}
{{SetManualAkb(
  name="Return Policy",
  content="Items can be returned within 30 days of purchase with original receipt. Refunds processed within 5-7 business days.",
  category="Policies",
  tags=["returns", "refunds", "policy", "customer-service"]
)}}
```

## Common Use Cases

### FAQ Management
```newo
{{!-- Add FAQ entries --}}
{{Set(name="faqs", value=CreateArray(
  {"name": "Shipping Time", "content": "Standard shipping takes 5-7 business days.", "category": "Shipping"},
  {"name": "Payment Methods", "content": "We accept Visa, Mastercard, PayPal, and Apple Pay.", "category": "Payment"},
  {"name": "Contact Support", "content": "Email support@example.com or call 1-800-EXAMPLE.", "category": "Support"}
))}}

{% for faq in faqs %}
  {{SetManualAkb(
    name=faq.name,
    content=faq.content,
    category=faq.category,
    tags=["faq", faq.category.lower()]
  )}}
{% endfor %}
```

### Dynamic Knowledge Creation
```newo
{{!-- Create knowledge from conversation insights --}}
{{Set(name="insight", value=GetState(name="conversation_insight"))}}

{{#if not IsEmpty(text=insight)}}
  {{SetManualAkb(
    name=Concat("Customer Insight: ", GetDateTime(format="date")),
    content=insight,
    category="Customer Insights",
    metadata={
      "source": "conversation",
      "customerId": GetUser(field="id"),
      "createdAt": GetDateTime()
    }
  )}}
{{/if}}
```

### Product Knowledge Base
```newo
{{!-- Add product information --}}
{{SetManualAkb(
  name=product_name,
  content=Concat(
    "Product: ", product_name, "\n",
    "Price: $", product_price, "\n",
    "Description: ", product_description, "\n",
    "Availability: ", product_availability
  ),
  category="Products",
  tags=[product_category, "product", product_id],
  metadata={
    "productId": product_id,
    "lastUpdated": GetDateTime(),
    "source": "product_catalog"
  }
)}}
```

### Training Data Addition
```newo
{{!-- Add agent training examples --}}
{{SetManualAkb(
  name="Greeting Response Example",
  content="When a customer says hello, respond warmly with: 'Hello! Welcome to [Business Name]. How can I make your day better?'",
  category="Agent Training",
  tags=["training", "greetings", "responses"]
)}}
```

## Best Practices

### 1. Use Descriptive Names
```newo
{{!-- Good: Clear, searchable names --}}
{{SetManualAkb(name="Holiday Return Policy Extension 2025", ...)}}

{{!-- Avoid: Vague names --}}
{{SetManualAkb(name="Policy Update", ...)}}
```

### 2. Include Relevant Tags
```newo
{{!-- Comprehensive tagging for searchability --}}
{{SetManualAkb(
  name="Cancellation Policy",
  content="...",
  tags=["cancellation", "refund", "policy", "booking", "reservation"]
)}}
```

### 3. Structure Content Clearly
```newo
{{!-- Well-structured content --}}
{{SetManualAkb(
  name="Reservation Guidelines",
  content="RESERVATION GUIDELINES\n\n1. Reservations must be made 24 hours in advance\n2. Party size maximum: 10 guests\n3. Cancellation: Please notify 2 hours before\n4. Late arrivals: Table held for 15 minutes\n\nFor special requests, contact us directly."
)}}
```

## Related Actions

- [**SearchFuzzyAkb**](./searchfuzzyakb) - Search knowledge base
- [**UpdateAkb**](./updateakb) - Update existing entries
- [**DeleteAkb**](./deleteakb) - Remove entries
- [**SetAkb**](./setakb) - Alternative entry creation
