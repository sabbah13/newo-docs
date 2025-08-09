---
title: JSON and Data Operations
---

### JSON and Data Operations

JSON helpers
- GetValueJSON(obj, key)
- UpdateValueJSON(obj, key, value)
- AppendItemsArrayJSON(array, items)
- GetIndexesOfItemsArrayJSON(array, filterPath)
- AsStringJSON(val)

Examples
```guidance
{{Set(name="idx", value=GetIndexesOfItemsArrayJSON(array=arr, filterPath=Concat("$[?(@=='", target, "')"])))}}
{{Set(name="payload", value=UpdateValueJSON(obj=payload, key="clientActorId", value=AsStringJSON(val=client_actor_id)))}}
```

Pitfalls
- Ensure `obj` parameters are valid JSON strings; wrap with `AsStringJSON` when building nested structures.
- Use `Stringify` before sending to connectors that expect plain text (e.g., HTTP headers, email body).

Strings and formatting
- `Concat(a, b, ...)` → concatenation.
- `Stringify(x)` → stringify value.

Predicates
- `IsEmpty(text)` → checks emptiness.
- `IsSimilar(val1, val2, strategy?, threshold)` → fuzzy comparison.

Datetime
- `GetDatetime(format, timezone)` → formatted timestamps.

Triggered payloads
- `GetTriggeredAct(fields=...)` → access trigger arguments (e.g., webhook payloads, scheduler callbacks).
