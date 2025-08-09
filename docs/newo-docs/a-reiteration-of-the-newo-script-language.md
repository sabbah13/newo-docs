A Reiteration of the Newo Script Language

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

A Reiteration of the Newo Script Language

Search

All

Pages

###### Start typing to search…

# A Reiteration of the Newo Script Language

Although it isn’t a requirement to dig into the trenches of code when dealing with the super agent framework (unless you really want to customize a lot), it is important to know some basic structures. Let’s go through some things you will encounter:

1.  **Newo Script:** This is the script language used within the agents, designed to feed information to Large Language Models (LLMs).
2.  **System Blocks:** These blocks are where calculations occur before sending prompts to the LLM. They are defined by system block tags {{#system~}}{{/system}}. Everything outside of a system block does not produce text sent to the LLM.
3.  **Assistant Blocks:** These blocks are instructions for the LLM on how to process prompts, including settings like temperature, which affects the randomness of the LLM's output. Near 0, more exact response, near 1, more creative. They are defined by assistant block tags {{#assistant~}}{{/assistant}}.

Updated 4 months ago

* * *
