# Introduction to Workflow Stages

A workflow consists of multiple stages, each managed by different agents. Let’s go through a particular use case of a restaurant table booking workflow to understand the various workflow stages and how information is passed from one stage to the next (i.e., how each agent passes its information to the next to perform its specific task).

Within the AKB, the Agent Main Instruction consists of the starting point instructions for the agent when a conversation (or event) is first started. It also contains the different workflows for a particular industry and prepares them to be able to shift to that particular workflow based on a user's needs. For example, if a super agent framework has been set for a restaurant, two workflows might be:

*   **Table booking workflow** (denoted as w1 - workflow 1): If a user shows interest in booking a table.
*   **Food delivery workflow** (denoted as w2 - workflow 2): If a user shows interest in ordering food.

Along with the Agent Main Instruction, several other pieces of context are used for context, which comes from a user's attributes (created when using the Quick Setup).

Let’s say a user shows interest in booking a table. This involves workflow 1 (denoted by w1 as identified by its task\_idn). The first stage of w1 is denoted by s1 and is managed by the Convo Agent, which collects user requirements such as date, time, and number of people for the table booking.

The Convo Agent stage requires the following AKB topics to function:

*   **task\_object\_format:** A JSON structure representing the data collected at this stage. For example, in s1, the data needed will be the number of people, the date, and the time of the booking.
*   **task\_instruction:** Plain text instructions on how to conduct the conversation (e.g., fields to be collected and some context to use throughout the conversation). Think back to basic examples of creating agents using instruction steps – the same situation here.
*   **task\_context:** Any additional information you’d like to provide for the agent to know about. This can include, for example, menu items, high-level business knowledge, and so on, which would help the conversation flow of this stage between agent and user.

> 📘

The output generated from the task\_object\_format is used as the input in the next stage of the flow (w1s2), and so on. Here’s a high-level overview of what the different stages might look like for a table booking workflow:

*   Convo Agent Worker collects user requirements such as date, time, and number of people.
*   A task object (containing the customer's desired timeslot for a booking) is created and fed as input into Stage 2.

*   Took the desired time slots as input from Stage 1.
*   Checks the available time slots on a service like OpenTable.
*   Managed by a specialized agent, such as the Magic Worker.
*   A task object is created based on the available slots around the desired time, which is fed as input into Stage 3.

*   Took the actual available time slots as input from Stage 2.
*   Convo Agent Worker confirms the available time slots with the user and collects other details necessary to make a booking, such as an email and phone number.
*   Task object is created with the agreed time for the booking.

*   Took the agreed time for the booking as input from Stage 3.
*   Books the confirmed time slot by going back to OpenTable.
*   Managed by the Magic Worker.

As you can see, each stage has a worker agent to help conduct the step. Other workers, such as the Sms Worker and Email Worker, can intervene to send communications to a manager to customers. However, in this case, OpenTable would send a booking confirmation to the user.

Workflow 2, for food orders, would follow a similar stage-by-stage flow but would include different Workers and instructions. The diagram below illustrates workflows and stages.

![](https://files.readme.io/ea98eb3-agent_logic_1.jpg)

Updated 4 months ago

* * *
