Event Identifier List

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Event Identifier List

Search

All

Pages

###### Start typing to search…

# Event Identifier List

Below are all current eventIdn's used within the Newo platform. Each event can have an associated subscription that performs specific actions in response to these triggers.

*   **conversation\_started:** This event is triggered when the Talking Head or Newo Chat page is opened for the first time on a computer in a specific browser or when a Vapi call is answered. You can create an event subscription for this event to perform some actions when a new conversation is started. Note that if the user closes the Talking Head or Newo Chat page and then opens it again, this event will not be triggered.
*   **conversation\_ended:** This event is triggered when a user ends a Vapi call.
*   **call\_aborted:** This event is triggered whenever a user or an agent hangs up the phone.
*   **call\_ended:** This event is triggered whenever a phone call cannot be started or is finished unexpectedly.
*   **user\_message:** This event is triggered every time a new message is sent to the Talking Head or Newo Chat. You can create an event subscription for this event to process incoming messages by your agent's flow.
*   **magic\_http\_response:** This event is triggered every time the Magic API connector receives a response from the target API. You can create an event subscription for this event to process the response by your Agent's flow.
*   **magic\_api\_response:** This event is triggered every time the Magic API connector receives a response from the target API. You can create an event subscription for this event to process the response by your Agent's flow.
*   **magic\_browser\_response:** This event is triggered every time the Magic Browser connector receives a response from the website. You can create an event subscription for this event to process the response by your Agent's flow.
*   **timer:** This event is triggered when the timer sets off. You can create an event subscription for this event to process the timer notifications by your Agent's flow.

Updated 4 months ago

* * *
