# “Hello World”

Getting started with the Newo.ai language is very simple but can be overwhelming if you’re unfamiliar with the basics. Every coder writes a “Hello World” program for their first exercise, which helps highlight some basic functionality of a coding environment. This is no exception with the Newo.ai platform. We can break down several Newo.ai actions and get you familiar with the platform using this basic example.

**Goal:** Have the Agent send “Hello World” in the Sandbox chat panel after triggering an event. No LLM involvement.

1.  Navigate to the Agents page, click the **three dots** icon at the top-right, and click **Create Agent**.
2.  Add an `Idn`, a unique identifier for your new Agent.
3.  Add a `Title` and a `Description` to describe the Agent within the platform. The fields are optional but will help when creating many Agents for different purposes later.

![](https://files.readme.io/8168d2715b46884ca5439d52b8402d167d62b34cbaddea9412894fe00cfa20ec-Screenshot_2025-03-14_at_09.21.01.png)

4.  Click the **+** icon by the `Persona` field.
5.  Add a `Name`, `Title`, and `Description`. This is the persona the Agent will assume. For example, the Agent's name could be Dillian, and the title could be Receptionist. Later, you will see that your Agent Persona can have context and instructions stored in the AKB.
6.  Click **Create**.

![](https://files.readme.io/443b29698c2b2cc5072356c78426d17cd110e095979431f1c1ec97c0f9d95d63-Screenshot_2025-03-14_at_09.27.11.png)

7.  Click **Update** to save the Agent. If you need to change the Agent details, click the **pencil** icon.

In order for the Newo.ai platform to connect to a Sandbox chat, integrations are needed with a connector.

1.  To create a new Sandbox connector, navigate to the Integrations page from the left-side panel.
2.  Click the **plus** icon on the `Sandbox Integration` item.
3.  Add a `Title` and `Idn`. In this case, just use `hello_connector` for both for simplicity.

![](https://files.readme.io/0b95c3ee72236bc0281f70d159ccc54e49f519d32c10e2d6242d39f5b3d7fe27-Screenshot_2025-03-14_at_09.31.56.png)

4.  Click **Save**.

Once a connector is created, it should automatically start running. If not, and you see the status as `Stopped`, you will need to enable it.

1.  Click the **three dots** icon on the right of the created connector.
2.  Click **Run**. The status will change to `Running`.

1.  Navigate to the Agents page.
2.  Click the **plus** icon next to the newly created Agent.
3.  Add a `Flow Idn`. For example, `ReceptionistFlow`. Ensure there are no spaces.
4.  Add a `Flow Title`, which is used to describe the Flow within the platform. In most cases, add the same name as the `Flow Idn`.

![](https://files.readme.io/fa5dfb10534c0fc6d8915cdb98416ccd3d27a56dc47c691317de72614b667e1f-Screenshot_2025-03-14_at_09.39.57.png)

5.  Click **Create** to save the Flow.
6.  Click the newly created Flow. This will open up the Flow Builder where we will code the Agent's behavior.

1.  Click the **plus** icon next to the Skills section on the left-side panel.
2.  Add a `Skill Idn`. Ensure there are no spaces.
3.  Add a `Skill title`. This is merely used as a description of the Skill (optional).

![](https://files.readme.io/badcba893c617b43d4c50ee1e405397ea24d0b909a526e36e5dbb1bfcfed06c1-Screenshot_2025-03-14_at_09.45.59.png)

4.  Click **Create** to save the Skill.

Note that `Skill Settings` appears on the right. This displays the Skills `Title`, `Idn`, `Model`, `Result action`, and `Result variable name`.

The `SendMessage` action is used to send plain text to the Sandbox chat. Copy the following code into the Skill Script section (i.e., the middle section of the interface):

```
{{SendMessage(message="Hello World")}}
```

In order for the newly created Skill to be activated, the Skill needs to be subscribed to an Event. This is because the Agent needs to know when or what Event needs to happen to send the message "Hello World." In this case, the Event trigger will be a message sent in the Sandbox chat.

1.  Click the **plus** icon next to the Event Subscription section on the left-side panel.
2.  Under `Event Idn`, select `user_message` from the dropdown.
3.  Under `Integration`, select `sandbox` from the dropdown.
4.  Under `Connector`, select `hello_connector` from the dropdown.
5.  Under `Skill selector`, select `skill_idn` from the dropdown. You are telling your Flow that when a user sends a message from the Sandbox chat, select a specific Skill to activate.
6.  In this case, you want to activate the newly created Skill. Select it from the `Skill name` dropdown.
7.  Under `Interrupt mode`, select `queue`.
8.  Add an `Event description`. This field is optional but will help in the future when identifying the purpose of an Event from a complex Flow containing multiple Event subscriptions.

![](https://files.readme.io/1a764ddb2e8693be6e9f7e661aa863843d28b38719843dcf486c4cd4a87704e5-Screenshot_2025-03-14_at_09.52.44.png)

9.  Click **Create** to save the Event.

1.  Click the **Open Sandbox** button at the top-right corner of the Flow Builder to open the Sandbox chat panel. Ensure the correct Agent persona is selected from the dropdown (i.e, Dillian).
2.  Click the **plus** icon next to the `User` section.
3.  Add a `Name`. In this case, this is the name of a user who will be talking to the Agent, which can be your name or a made-up name for testing purposes.
4.  Ensure the `Create actor` checkbox has been selected. An Actor is someone who communicates through a specific connector. For example, a specific user could communicate via the Sandbox chat (Sandbox chat connector) and over the phone (Vapi connector), which each have identifiers of separate Actors. In this case, we are going to create a single Actor for Sandbox chat communications.
5.  Under the `Actor settings`, select `sandbox` for the `Integration` and `hello_connector` for the `Connector`.

![](https://files.readme.io/b0b37b8284ebeb7473763c18ca2c980714837c2755d672eca74228c0b590de5f-Screenshot_2025-03-14_at_10.00.00.png)

6.  Click **Create and apply** to save the user.

1.  Click **Save and Publish** in the top-right corner of the Flow Builder.
2.  Type anything in the Sandbox chat field, and click the **send** icon. The response should be "Hello World."

Updated 4 months ago

* * *
