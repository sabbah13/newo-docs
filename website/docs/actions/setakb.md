---
sidebar_position: 15
title: "SetAKB"
description: "Store context information in the Active Knowledge Base"
---

# SetAKB

Convert context information into an AKB (Active Knowledge Base) topic by extracting facts and creating an automatic summary using LLM processing.

## Syntax

```newo
SetAKB(
  context: str,
  labels: list[str] | None = None,
  providerIdn: str | None = None,
  modelIdn: str | None = None,
  personaId: str | None = None
)
```

## Parameters

### Required Parameters

- **`context`** (string): The information to convert into an AKB topic

### Optional Parameters

- **`labels`** (list[string]): Labels to attach to the AKB topic for categorization
- **`providerIdn`** (string): Provider identifier (not currently used)
- **`modelIdn`** (string): Model identifier (not currently used) 
- **`personaId`** (string): Persona ID to attach for later filtering

## How It Works

1. **Content Analysis**: LLM processes the provided context information
2. **Fact Extraction**: Automatically extracts key facts and insights
3. **Summary Generation**: Creates a structured summary of the information
4. **Topic Creation**: Stores the processed information as an AKB topic
5. **Labeling**: Applies any provided labels for organization

## Use Cases

### Basic Knowledge Storage
```newo
{{!-- Store customer information --}}
{{SetAKB(
  context="Customer John Smith called about billing issue with account #12345. Resolved by applying $50 credit for service outage on Jan 15th.",
  labels=["billing", "customer_service", "resolution"]
)}}
```

### Meeting Documentation
```newo
{{!-- Store meeting notes --}}
{{SetAKB(
  context="Team meeting discussed Q2 goals: increase customer satisfaction by 15%, launch mobile app, hire 3 new developers. Budget approved for $200K.",
  labels=["meetings", "q2_planning", "budget", "hiring"],
  personaId=GetUser(field="id")
)}}
```

## Related Actions

- [**UpdateValueJSON**](./updatevaluejson) - Update JSON data
- [**SetState**](./setstate) - Store values in conversation state