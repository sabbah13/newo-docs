# Portal API

```
x-portal-secret=SECRET  
x-portal-external-customer-id=CUSTOMER_ID [Optional]
```

```
GET https://api.stg.newo.ai/api/v1/bff/sessions
```

```
{
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "persona": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "actor_id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "string",
        "external_id": "string",
        "is_deleted": false
      },
      "integration_idn": "integration_idn",
      "connector_idn": "connector_idn",
      "created_at": "2024-01-01T12:00:00Z",
      "arguments": {
        "key1": "value1",
        "key2": "value2"
      },
      "user_messages_count": 10,
      "agent_messages_count": 5,
      "messages_count": 15,
      "events_count": 2,
      "latest_message_datetime": "2024-01-01T12:10:00Z",
      "latest_event_datetime": "2024-01-01T12:15:00Z",
      "ended_at": "2024-01-01T12:30:00Z"
    }
  ],
  "metadata": {
    "page": 1,
    "per": 20,
    "total": 20
  }
}
```

**Query Parameters:**

*   `page (integer, required)` – The page number of the paginated response.
*   `per (integer, required)` – The number of items per page.
*   `from_datetime (string, optional)` – Filter sessions starting from this datetime (YYYY-MM-DDTHH:MM:SSZ).
*   `to_datetime (string, optional)` – Filter sessions up to this datetime (YYYY-MM-DDTHH:MM:SSZ).
*   `connectors (array, optional)` – Filter by connector identifiers (e.g., sandbox/\*, sandbox/some\_connector).
*   `is_active (boolean, optional)` – Filter active sessions only.

**Response:**

*   `200 OK` – Successfully returns a paginated list of sessions.
*   `4XX` – Request error.

```
GET https://api.stg.newo.ai/api/v1/bff/sessions/info
```

```
{
  "sessions_by_date": [
    {
      "date": "2024-12-01",
      "count": 10
    }
  ],
  "sessions_by_type": [
    {
      "type": "booking",
      "count": 3
    }
  ],
  "sessions_by_channel": [
    {
      "channel": "chat",
      "count": 3
    }
  ],
  "sessions_by_hours": [
    {
      "hour": "Non working hours",
      "count": 2
    }
  ],
  "sessions_by_asr": [
    {
      "date": "2024-12-01",
      "sum": 10
    }
  ],
  "total": 20
}
```

**Query Parameters:**

*   `from_datetime (string, required)` – Start date of the period.
*   `to_datetime (string, required)` – End date of the period.

**Response:**

*   `200 OK` – Successfully returns a paginated list of sessions.
*   `4XX` – Request error.

```
GET https://api.stg.newo.ai/api/v1/bff/customer/attributes
```

```
{
  "groups": ["group"],
  "attributes": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "idn": "attribute_1",
      "value": "value_1",
      "title": "Title",
      "description": "description",
      "group": "group",
      "is_hidden": false,
      "possible_values": [],
      "value_type": “string”,
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "idn": "attribute_2",
      "value": "value_2",
      "title": "Title 2",
      "description": "description 2",
      "group": "group",
      "is_hidden": false,
      "possible_values": [],
      "value_type": “string”,
    }
  ]
}
```

**Query Parameters:**

*   `query (string, optional)` – Search query for name, title, or group.

**Response:**

*   `200 OK` – Successfully returns a list of customer attributes.
*   `4XX` – Request error.

```
GET https://api.stg.newo.ai/api/v1/customer/attributes/{attribute_id}
```

```
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "idn": "attribute_1",
  "value": "value",
  "title": "Title",
  "description": "description",
  "group": "group",
  "is_hidden": false,
  "possible_values": [],
  "value_type": "string"
}
```

**Path Parameters:**

*   `attribute_id (UUID, required)` – The unique identifier of the attribute.

**Response:**

*   `200 OK` – Attribute retrieved successfully.
*   `4XX` – Request error.

```
PUT https://api.stg.newo.ai/api/v1/customer/attributes/{attribute_id}
```

```
{
  "value": "value",
  "title": "Title",
  "description": "description",
  "group": "group",
  "is_hidden": false,
  "possible_values": [],
  "value_type": "string"
}
```

**Path Parameters:**

*   `attribute_id (UUID, required)` – The unique identifier of the attribute.

**Response:**

*   `200 OK` – Attribute updated successfully.
*   `4XX` – Request error.

Updated 4 months ago

* * *
