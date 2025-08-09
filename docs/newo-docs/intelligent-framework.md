# Intelligent Framework

The Newo Intelligent Flow Framework, also referred to as the Newo Framework, is a high-level framework that enables rapid development of Intelligent Agents (IAs). Anyone without special programming skills can create an intelligent agent.

The image further below highlights the Newo.ai platform architecture. It comprises several main areas working together:

*   End users
*   Interface layer
*   Newo.ai platform
*   Generative models layer
*   Customer organization
*   Static and dynamic data

End users (i.e., human users) interact with digital employees (or digital agents) via a physical interface layer. Users are usually thought of as external to an organization using the Newo.ai platform but can also be internal users who need to communicate with the agent for testing purposes.

The physical interface layer communicates with the intelligent agents by sending/receiving information via the Newo API. Information can be sent back to the end user via the interface layer.

Flow designers and organizations can interact with the Newo API via the platform to create agents to suit their needs. The agents require access to the generative models layer via an LLM API (residing outside the the Newo.ai platform) to produce appropriate results/responses to end users. Additionally, to provide contextual prompts to the LLM, external static and dynamic data are retrieved from various connected sources.

Static data is data that does not change frequently, such as a website, PDF with instructions, or troubleshooting documents. Dynamic data is data that changes frequently and, therefore, needs to be observed often.

For example, during a call between a user and a hotel receptionist agent, the agent may need to retrieve information immediately from a list of known available hotel rooms and updated pricing. In order for the Newo.ai platform to connect to the outside world and interface layer, integrations are needed with a connector for each.

Here’s the interesting part: The Newo.ai platform has the out-of-the-box ability for an agent to talk to a user using different communication channels. For example, a user (human) can communicate with a digital employee of a hotel via a phone call, Moxie Robot, lobby smart speaker, email, SMS, or any other form of communication.

Initially, the Newo.ai system may see these different communications from this single person as different actors, but later, as soon as the system understands that all the actors belong to the same user, they will be merged into the same user. This mapping of different physical world communication channels to the same historical memory and persona of a user is what makes the Newo.ai platform stand out.

![](https://files.readme.io/9f5f998-Newo.AI_Platform_Architecture.png)

Updated 4 months ago

* * *
