Skill Script

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Skill Script

Search

All

Pages

###### Start typing to search…

# Skill Script

Skill Script is something between a text prompt for an LLM and a program that is interpreted word for word by a special runner whose task is to insert the necessary information into the text prompt.

Below, we describe the case if the Skill Script is written for runner Guidance.

If you look at examples of Skill Script from later examples in this guide, you will see that part of the text is enclosed in double curly brackets, and part of the text is outside the double curly brackets.

Segments enclosed in double curly brackets will be processed sequentially and turned into text (including the degenerate case of turning into empty text). Guidance uses Handlebars syntax, allowing for complex structures and output formats.

The main concepts in the Guidance language include:

*   **Variable Interpolation:** Using {{variable\_name}} syntax to insert variables into the text.
*   **Logical Control:** Employing constructs like {{#if condition}}...{{/if}} to control the flow based on conditions.
*   **Generation Commands:** The {{gen}} and {{select}} commands allow the language model to generate text guided by parameters like temperature and max tokens.
*   **Role Tags:** Using {{#system}}...{{/system}} and {{#assistant}}...{{/assistant}} to define different participants in a dialog, such as system, user, and assistant.
*   **Comments:** Created using the {{~! This is a comment }} syntax.
*   **Hidden Blocks:** {{#block(hidden=True)}} … {{/block}} allow certain parts of the template to be processed without actually outputting its results to the final text. This can be useful for calculations or decisions that affect other parts of the template but should not be visible in the output.

Updated 4 months ago

* * *
