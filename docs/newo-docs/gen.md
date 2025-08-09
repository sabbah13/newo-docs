Gen

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Gen

Search

All

Pages

###### Start typing to search…

# Gen

The Gen action facilitates synchronous communication with a Large Language Model (LLM). It processes a prompt and returns the result for further use in the application without streaming it to the client. It is ideal for scenarios requiring full responses before client delivery, such as JSON API calls or outputs needing validation.

```
Gen(
  temperature: float = 0.75, 
  stop: List[str] = None, 
  maxTokens: int = None, 
  topP: float = 1, 
  skipFilter: bool = False, 
  skipChecks: bool = False, 
  maxRetries: int = 5, 
  jsonSchema: str = None
)
```

#### 

Where:

[](#where)

*   **temperature:** (Optional) Controls the randomness of the output (higher values produce more random outputs).
*   **stop:** (Optional) Stops generation when specific sequences are detected. Defaults to agent names/usernames (e.g., `["Agent:", "User:"]`) to prevent unwanted dialogue continuations. Customize to halt generation at markers like `"."` or `"]"` for JSON parsing.
*   **maxTokens:** (Optional) The maximum number of tokens to generate (i.e., limiting the length of the response).
*   **topP:** (Optional) Nucleus sampling value for output diversity. Lower values (e.g., `0.5`) restrict vocabulary; `1` allows full diversity. Unlike `temperature`, `topP` focuses on probability mass rather than randomness.
*   **skipFilter:** (Optional) Skips content moderation filters. Enable for JSON outputs to preserve brackets/formatting. Disable for user-facing text to enforce safety checks.
*   **skipChecks:** (Optional) Skips validation checks on input/output.
*   **maxRetries:** The number of times to retry failed LLM requests. Addresses provider instability (e.g., OpenAI occasionally returning empty responses).
*   **jsonSchema:** Enforces JSON output structure. It guides the LLM in adhering to a schema (e.g., OpenAPI specs). Often paired with prompts for reliable parsing.

Updated 4 months ago

* * *
