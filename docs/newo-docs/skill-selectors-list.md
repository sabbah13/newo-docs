Skill Selectors List

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Skill Selectors List

Search

All

Pages

###### Start typing to search…

# Skill Selectors List

The following highlights the differences between the two available Skill selectors when creating an event subscription:

*   **skill\_idn:** Selects the skill identifier ("Skill Idn") of a specific Skill. For example, setting up an event subscription to send a message to the Sandbox chat after a user has sent a message requires choosing "skill\_idn" from the "Skill selector" dropdown. The "Skill name" dropdown will populate with known Skills within your current Flow (i.e., a message-sending Skill). By creating this event subscription, you are telling your Flow that when a user sends a message from the Sandbox chat, select the specific Skill to activate.
*   **skill\_idn\_from\_state:** Selects the state identifier ("State Idn") of a specific State Field. For example, setting up an event subscription to create Skill-switching capabilities requires choosing "skill\_idn\_from\_state" from the "Skill selector" dropdown. The "Skill name" dropdown will populate with known state identifiers within your current Flow. By creating this event subscription, you are telling your Flow that when something (a trigger) happens, select the specific State Field to activate.

Updated 4 months ago

* * *
