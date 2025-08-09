GenStream

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

GenStream

Search

⌘K

All

Documentation

Reference

Pages

###### Start typing to search…

# GenStream

The GenStream action connects to a Large Language Model (LLM), streams the response to the client in real time, and returns the result to the script. This is ideal for dynamic scenarios where immediate feedback or live updates are necessary. The action supports advanced interruption modes to handle changing requirements mid-stream.

`GenStream(   interruptMode: Literal["interruptWindow", "interrupt", "none"] = "interrupt",     interruptWindow: float = None,     sendTo: Literal["actors", "currentActor", "latestMessageActor"] = "currentActor",     actorIds: list[str] = None,     temperature: float = 0.75,     stop: list[str] = None,     maxTokens: int = None,     topP: float = 1.0,     skipFilter: bool = False,     skipChecks: bool = False,     maxRetries: int = 5 )`

#### 

Where:

[](#where)

*   **interruptMode:** Various modes to change how message generation handles interruptions.
    *   **interrupt:** The generation process will be immediately interrupted if a new event occurs. This is useful when prioritizing new events over ongoing message generation.
    *   **interruptWindow:** Enables the interruptWindow setting.
    *   **none:** The generation process will not be interrupted, regardless of new incoming events. The message will be generated fully before handling any new events.
*   **interruptWindow:** Specifies a time window (in seconds) during which an interruption can occur. If an interrupting event happens within this window, the generation is stopped. If no events occur within the window, the message completes uninterrupted.
*   **sendTo:** Specify where to send the generated response.
    *   **actors:** Sends the generated message to a specific list of actors. This requires providing the actorIds parameter to identify the recipients.
    *   **currentActor:** Sends the response back to the actor that triggered the current event. This is the default option and is typically used in one-to-one interactions.
    *   **latestMessageActor:** Sends the generated output to the actor involved in the most recent message interaction. This ensures continuity, especially when the current context has shifted to a different actor.
*   **actorIds:** A list of actor IDNs to which to send the generated message.
*   **temperature:** (Optional) Controls the randomness of the output (higher values produce more random outputs).
*   **stop:** (Optional) Stops generation when specific sequences are detected. Defaults to agent names/usernames (e.g., `["Agent:", "User:"]`) to prevent unwanted dialogue continuations. Customize to halt generation at markers like `"."` or `"]"` for JSON parsing.
*   **maxTokens:** (Optional) The maximum number of tokens to generate (i.e., limiting the length of the response).
*   **topP:** (Optional) Nucleus sampling value for output diversity. Lower values (e.g., `0.5`) restrict vocabulary; `1` allows full diversity. Unlike `temperature`, `topP` focuses on probability mass rather than randomness.
*   **skipFilter:** (Optional) Skips content moderation filters. Enable for JSON outputs to preserve brackets/formatting. Disable for user-facing text to enforce safety checks.
*   **skipChecks:** (Optional) Skips validation checks on input/output.
*   **maxRetries:** The number of times to retry failed LLM requests. Addresses provider instability (e.g., OpenAI occasionally returning empty responses).

Updated 4 months ago

* * *

Did this page help you?

Yes

No
