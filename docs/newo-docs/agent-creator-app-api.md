# Agent Creator App API

The Agent Creator App allows seamless integration of AI-driven chat capabilities into your system using the Newo chat connector. This guide provides a step-by-step walkthrough on setting up, initializing, and handling real-time events.

1.  Navigate to the Integrations page: `builder.newo.ai/integrations`.
2.  Click the **plus (+)** button to create a new Newo Chat integration.
3.  Provide the required details:
    1.  `idn`: Unique identifier for the connector.
    2.  `title`: Name of the integration.
    3.  `Domain`: The domain where the widget or app will be placed:
        1.  Use `http://localhost` for local development.
        2.  Use `https://example.com` for production.
4.  After saving, a `CLIENT_SECRET` will be generated and displayed in the modal. This `CLIENT_SECRET` is required to make API requests to Newo.

![](https://files.readme.io/245f972699a7e919e607f42b81e15cbe7d28fa680c6c43d63131fed77008885d-image.png)

To communicate with the connector, you need to obtain its `connector_idn` and establish a WebSocket connection for real-time updates.

```
GET https://chat.newo.ai/api/internal/v1/talking-head/chat-settings?client_secret=CLIENT_SECRET
```

```
type ConnectorSettings = {
  connector_idn: string
};
```

To identify customers in the Newo system, create an actor using the following request:

```
POST https://chat.newo.ai/api/internal/v1/talking-head/create-actor
```

```
type CreateActorPayload = {
  name: string; // Customer actor's name
  external_id: string; // Unique identifier of your customer (external_customer_id)
  connector_idn: string; // Connector IDN
  client_secret: string; // Client secret
};
```

To track the parsing progress and receive data updates, establish a WebSocket connection using socket.io:

```
io("https://chat.newo.ai/", {
   transports: ['websocket'],
   query: {
       client_secret,
       origin: globalThis.origin, // webpage origin e.g. https://example.com
       external_id
   }
});
```

```
POST https://chat.newo.ai/api/internal/v1/talking-head/send-actor-event
```

```
type ParsingRequestPayload = {
  client_secret: string;
  connector_idn: string;
  event_idn: "onboarding_started";
  external_id: string;
  arguments: Array<{
    name: string;
    value: string;
  }>;
};
```

**Arguments:**

*   `referral`: Email address of the referral source.
*   `name`: Name of the customer.
*   `email`: Email address of the customer.
*   `phone_number`: Phone number of the customer.
*   `source`: Either a website URL.
*   `country_code`: The country code associated with the customer.
*   `external_customer_id`: Your customer ID.
*   `query_params`: Additional query parameters in JSON format.

As soon as parsing begins, socket events notify about the progress.

Provides real-time updates during the parsing process.

```
type NotifyScrapingStepEvent = {
  integration_idn: "newo_chat";
  connector_idn: string;
  command_idn: "notify_scraping_step";
  external_event_id: string;
  arguments: Array<{
    name: string;
    value: string;
  }>;
};
```

**Arguments:**

*   `user_actor_id`: Unique identifier of the customer actor.
*   `question`: The specific data point being parsed (e.g., business\_working\_hours).
*   `answer`: The extracted response to the question.
*   `step_number`: The current parsing step number.
*   `max_steps`: The total number of steps in the parsing process.
*   `stage`: The processing stage (preprocessing, stage, postprocessing).

Triggered when a new customer has been successfully onboarded.

```
type OnboardingFinishedEvent = {
  integration_idn: string;
  connector_idn: string;
  command_idn: "notify_scraping_finished";
  external_event_id: string;
  arguments: Array<{
    name: string;
    value: string;
  }>;
};
```

**Arguments:**

*   `user_actor_id`: Unique identifier of the customer actor.
*   `business_name`: Name of the business extracted from the data.
*   `agent_name`: Name of the AI agent assigned to the customer.
*   `agent_title`: Role/title of the AI agent (e.g., AI Host).
*   `industry`: Industry category associated with the business.

To check the processing status, send the following request:

```
POST https://chat.stg.newo.ai/api/internal/v1/talking-head/send-actor-event
```

```
type ProcessingStatusRequest = {
  client_secret: string;
  connector_idn: string;
  external_id: string;
  event_idn: "agent_request";
  arguments: [];
};
```

Triggered after requesting the processing status.

```
type AgentInfoEvent = {
  integration_idn: string;
  connector_idn: string;
  command_idn: "agent_info";
  external_event_id: string;
  arguments: Array<{
    name: string;
    value: string;
  }>;
};
```

**Arguments:**

*   `user_actor_id`: Unique identifier of the customer actor.
*   `phone_number`: The phone number associated with the customer.
*   `created_customer_idn`: The unique identifier of the newly created customer.
*   `state`: Current processing state (start, created, etc.).
*   `email`: Email address of the customer.
*   `business_name`: Name of the business associated with the customer.
*   `agent_name`: Name of the AI agent assigned to the customer.
*   `agent_title`: Role/title of the AI agent (e.g., AI Sales Rep).

This section allows users to request and monitor the processing status of their onboarding process in real time.

Returns details about the newly created customer and assigned AI agent.

```
type OnboardingFinishedEvent = {
  integration_idn: string;
  connector_idn: string;
  command_idn: "onboarding_finished";
  external_event_id: string;
  arguments: Array<{
    name: string;
    value: string;
  }>;
};
```

**Arguments:**

*   `user_actor_id:`: Unique identifier of the customer actor.
*   `phone_number:`: AI agent phone number.
*   `created_customer_idn`: The unique identifier of the newly created customer.
*   `email`: Email address of the customer.
*   `industry`: Industry category of the customer's business.
*   `business_name`: Name of the business associated with the customer.
*   `agent_name`: Name of the AI agent assigned to the customer.
*   `agent_title`: Role/title of the AI agent (e.g., AI Host).

Triggered when an error occurs during the onboarding process.

```
type OnboardingErrorEvent = {
  integration_idn: string;
  connector_idn: string;
  command_idn: "onboarding_error";
  external_event_id: string;
  arguments: Array<{
    name: string;
    value: string;
  }>;
};
```

**Arguments:**

*   `description`: A message describing the error that occurred.

This marks the completion of the customer registration process, making the AI agent ready to interact with the newly onboarded customer.

Updated 4 months ago

* * *
