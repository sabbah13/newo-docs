# Waiting Response Timers

A timer integrated into your agents behavior is important to be able to respond to instances when a user may have forgotten to reply and a friendly prompt is needed. Alternatively, a timer could be used to provide updates to a user if the agent needs time to respond.

**Goal:** Add two follow-up timers to prompt a user to reply. This is a basic integration, and will be expanded on in more advanced agents.

> 📘

For this agent, to remove any complexity, start with a basic agent, as set up for the “Hello World” example. You should have a Sandbox chat event and one main Skill.

A Skill needs to be created for each of the two follow-up timers that will be set up. For the “Skill Idn” and “Skill title” for the first new Skill, use “FollowupFirstSkill.” For the second new Skill, use “FollowupSecondSkill.”

For each timer instance with defined parameters, a timer connector is required.

1.  To create a new Timer connector, navigate to the Integrations page from the left-side panel.
2.  Click the **plus** icon on the “Timer Integration (Programmable)” item.
3.  Add a “Title” and “Idn.” In this case, just call the title and idn “follow\_up\_first.”
4.  Click **Save**.
5.  Repeat steps 2 to 4, except use “follow\_up\_second” for the “Title” and “Idn.”

In order for the newly created timer Skill to be activated, the Skill needs to be subscribed to an event, which will be triggered when the main Skill is triggered by sending a message in the Sandbox chat.

1.  Click the **plus** icon next to the Event Subscription section on the left-side panel.
2.  Under the “Event Idn,” select “timer” from the dropdown.
3.  Under “Integration,” select “program\_timer” from the dropdown.
4.  Under “Connector,” select “follow\_up\_first\_skill” from the dropdown.
5.  Under “Skill selector,” select “skill\_idn” from the dropdown.
6.  Under “Skill name,” select “FollowupFirstSkill” from the dropdown.
7.  Add an “Event description.” This field is optional but will help in the future when identifying the purpose of an event from a complex flow containing multiple event subscriptions.
8.  Click **Create** to save the event.
9.  Repeat steps 1 to 8 but for the second follow-up Skill and connector.

Replace everything in the main Skill with the following Skill Script:

```
{{SendMessage(message='MainSkill triggered', actorIds=GetActors(integrationIdn="sandbox", connectorIdn="connector", personaId=GetUser(field="id")))}}

{{SendCommand(commandIdn="set_timer", integrationIdn="program_timer", connectorIdn="follow_up_first", persona_id=GetUser(field="id"), timer_name="AnyName1", interval="5", repeatable="false", enabled="true")}}

{{SendCommand(commandIdn="set_timer", integrationIdn="program_timer", connectorIdn="follow_up_second", persona_id=GetUser(field="id"), timer_name="AnyName2", interval="10", repeatable="false", enabled="true")}}
```

Add the following to the “FollowupFirstSkill.”

```
{{SendMessage(message="Are you still there?", actorIds=GetActors(integrationIdn="sandbox", connectorIdn="connector", personaId=GetUser(field="id")))}}
```

Add the following to the “FollowupSecondSkill.”

```
{{SendMessage(message="Hellooooo?", actorIds=GetActors(integrationIdn="sandbox", connectorIdn="connector", personaId=GetUser(field="id")))}}
```

1.  Click **Save and Publish** in the top-right corner of the Flow Builder.
2.  Type anything in the Sandbox chat field, and click the **send** icon.

The response will be a message saying “MainSkill triggered,” followed by a 5 second delay, another message saying “Are you still there?” followed by a 5 second delay, and another message saying “Hellooooo?”

This example used short interval timers to illustrate the functionality. However, you will need to adjust the timer intervals within the main Skill to something longer. The interval parameters are in seconds. Since the timers are all activated at the same time within the main Skill, ensure the intervals are stepped (i.e., timer 2 should be longer than timer 1).

Updated 4 months ago

* * *
