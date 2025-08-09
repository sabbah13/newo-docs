# Debugging

If you’ve received an incorrect, broken, or unexpected reply from your agent, you’ll need to debug the agent's answers. In electrical engineering, there is a simple principle:

> There are only two reasons a device does not work – either there is no contact where it should be, or there is contact where it should not be.

This principle applies if an LLM generates an incorrect/bad response. Either it was not given the information it needed to generate the correct answer, or it was given the incorrect information.

An LLM is a function, which means it has input argument(s) and produces an output result. The input argument for an LLM is a prompt, which means that if something broke, something was missing in the prompt.

So, how do debug your agent that provided an incorrect/broken/unexpected reply? Follow these three steps:

1.  Find the broken reply in the Sandbox chat history or in the logs.
2.  Open the prompt which was sent to the LLM.
3.  Read the prompt and ask yourself why the LLM could have generated this broken reply.

In most cases, you will realize that the LLM did not see the necessary information to answer. This information was expected to be in the prompt but is missing. When you understand which block was missing in the ConvoAgent prompt, you can find a way to ensure it gets added to the prompt to provide the correct response.

What information blocks are present in the ConvoAgent prompt?

1.  **Static blocks** (which are present at all steps of any workflow):

*   Agent Persona and Roles
*   Agent Main Instruction
*   Business Context
*   Explicit Constraints

2.  **Workflow step blocks** (these change at each workflow step):

*   Task Object
*   Task Object Format
*   Task Instruction
*   Task Context (which is the Task Object received from the preceding workflow step)

3.  **System dynamic blocks**:

*   Memory (Agent-User conversation history with agent “thoughts”)
*   Supervisor Agent missing info comments

**Erroneous Answer:** At the very beginning of the conversation, the Agent, when asked about the availability of a vegetarian burger on the menu, answered, “I’m not sure.” Although there is a vegetarian burger on the menu.

**Prompt Analysis Showed:** At the moment of answering “I’m not sure,” the agent had not yet started executing the first step of the “food\_ordering” workflow. At the very beginning of the conversation, ConvoAgent only observed the static blocks and system dynamic blocks but did not observe the workflow step blocks. The menu is the Task Context of the first step of the “food\_ordering” workflow.

**The Fix:** We included a brief overview of the dishes in the Business Context section. This greatly improved the responses at times when the detailed menu was not being reviewed.

**Erroneous Answer:** When asked if you have any free floating tank slots for tomorrow, the Spa Agent gave the answer, “We don’t have any free slots for tomorrow.” Although, in reality, there were slots available.

**Prompt Analysis Showed:** At the moment of the answer, the agent was at the third step of the “book\_workflow.” At this stage, it was supposed to review the list of free slots as the Task Context, which it should have received from the previous (second) step of the workflow.

However, the Task Context showed free slots that did not correspond to reality. Where does the Task Context of the current step come from? It is the Task Object of the previous step. Who performed the previous (second) step? MagicWorker. This means we need to look at how the task for MagicWorker was set.

The analysis showed that MagicWorker received a task from ConvoAgent (from the first step of the workflow) where an incorrect date was specified. Then, it became clear that when creating the Spa account, the time zone was mistakenly specified, which led to the fact that at borderline moments, the word “tomorrow” generated the output of an erroneous date.

**The Fix:** We corrected the time zone of the business.

If an LLM generates an incorrect or strange response, it most often means that the necessary information was not in the prompt. Study the prompt and understand what was missing. Once you understand this, decide in which of the ConvoAgent prompt information blocks this information should have been. Change the static blocks or workflow task objects or task instructions and make sure the problem is resolved.

Updated 4 months ago

* * *
