Skills

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Skills

Search

All

Pages

###### Start typing to search…

# Skills

Skills represent the logic of an agent (i.e., where you explain what the agent should do). Skills have various parameters/parts, such as:

*   **Skill Script:** The main text used to generate an LLM prompt using a combination of Actions, instructions, context information, and user-agent memory.
*   **Result Variable Name:** “RESULT” by default.
*   **Result Action:** You can set an action that should be performed as a result of the skill's action (i.e., do nothing or send to the default actor of the current person or save in a particular State Field.).
*   **Event Subscription:** Events to which this Skill is subscribed. Events are a service in the Newo.ai platform that links API calls from external systems and also determines the schedule of agent Skills calls over time.
*   **Parameters:** Named variables that can be passed to the Skill when called.
*   **Gen/Select Functions:** Return values of named variables.
*   **LLM Model:** The named model to be used within the Skill.
*   **Runner Type:** This is the “interpreter” of the Skill Script. Supported languages/syntaxes include Guidance, Exec, and LMQL.
*   **Comments:** Plain text used to make notes or explain sections within the Skill Script. These comments are ignored when the Skills Script is processed.

Updated 4 months ago

* * *
