A Reiteration of Past Terminology

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

A Reiteration of Past Terminology

Search

All

Pages

###### Start typing to search…

# A Reiteration of Past Terminology

The terminology used throughout this documentation remains the same, but let’s reiterate their meaning with reference to the Super Agent framework:

*   **Flows:** A flow is a sequence of tasks performed by agents. Two flows can run in parallel, but each flow’s Skills run in succession. For example, the Email Worker and SMS Worker flow can run in parallel, but each skill within these flows run one after the other.
*   **Skills:** Skills are isolated sub-programs within the agents. One skill calls another in a sequential manner within a flow. For example, Skills within the Email Worker flow consist of email format, email send, and various other intermediate skills.
*   **Events:** Events are triggers that initiate actions within the agents. For example, user messages via web chat, email, or voice call generate events that the agents respond to.
*   **Main Skill:** The ConvoMainSkill (found within the CA Convo flow) is user-facing and processes user messages. It starts when an event (e.g., user message) occurs.

Updated 4 months ago

* * *
