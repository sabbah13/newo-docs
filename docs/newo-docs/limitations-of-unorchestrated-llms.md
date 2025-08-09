# Limitations of Unorchestrated LLMs

![](https://files.readme.io/aece55e-_eefb3e32-5150-4601-9ff6-871073d05fd5.jpeg)

If you still aren’t convinced that standalone LLMs lack the ability to create AI agents, then here are a few of the most fundamental technical limitations of unorchestrated LLMs:

**Workflows and chaining:** Almost any business task is a complex sequence of steps that need to be performed to achieve a goal. Even a simple business task is not a tram ride with pre-known stops. It's a journey from point A to B in a metropolis during rush hour, where you can get there by thousands of different routes, and decisions on how exactly to proceed need to be made on the fly, taking into account dynamic external data, previous experience, and the goal set.

Let's say a customer calls your hotel asking about available rooms for the weekend. They need two standard rooms. But let's assume you don't have two standard rooms available. However, you do have a two-bedroom suite. The agent should not just refuse the booking but inquire if the customer (possibly a family of two adults and two children) would be satisfied with the suite.

And if they decline (perhaps because the suite is more expensive than two standard rooms), could a discount be offered? Or offer one double room and one single room but add an extra bed? And so on.

Creating old-fashioned bots a few years ago, we had to write down all these possible branches manually. But it was extremely labor-intensive, it greatly annoyed customers (remember calling an airline and encountering that terrible bot?), and these monstrous rule-based bot scenarios were extremely difficult to maintain in working order.

Newo.ai Digital Employees don't require all possible rules to be written down. You tell them in the instructions much like you would explain to your biological employee: “If the requested rooms for the specified dates are not available, negotiate and find possible compromises. For example, offer a different combination of rooms (and if it turns out to be more expensive, you can give a discount, but only up to 10%), or propose slightly different check-in/check-out dates.” That's all. And it will work. This feature of the Newo.ai platform is called Intelligent Flow.

**Stateless nature:** An LLM doesn't remember anything between its calls. The model doesn't remember the conversation history, your client's name, or the name of your hotel. To ensure that the model consistently communicates with each of your clients or employees, orchestration is needed in restoring recent conversation history with the client and important facts from long-term memory. This is also handled by the Newo.ai platform, storing and retrieving necessary parts of the conversation and other facts from memory.

**External data (Static and dynamic):** Ask ChatGPT how much a suite costs in your hotel today. Naturally, the model won't be able to answer. To do so, it needs to “see” the current prices from your reservation system. That is, special orchestration is needed for dynamic communication between your digital employees and your external corporate systems.

If such data changes rarely (documentation in Confluence, articles on your website, your corporate PDF documents, etc.), we call them static external data. If the data can change hourly or minute-by-minute (Jira tickets, CRM records, ERP, HIRS data, financial systems, etc.), we call them dynamic data.

**Hallucinations:** In industrial use, we can't afford for the model to make up facts about your products and services. We need deterministic results. Moreover, LLMs sometimes fail when asked to do calculations, execute code, or run algorithms. Special built-in checks need to be orchestrated to ensure the stable operation of your intelligent agent.

**Human in the loop, privacy, security, and compliance:** Many systems must take special care that LLMs do not exfiltrate private data, access data or APIs they aren’t authorized for, and do not return offensive or undesirable responses.

Updated 4 months ago

* * *
