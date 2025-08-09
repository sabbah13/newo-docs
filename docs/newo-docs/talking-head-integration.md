# Talking Head (Web Chat) Integration

You’ve likely seen a chatbot on a website before (usually located at the bottom-right corner). The Talking Head integration is a step ahead in that you are able to have either a text-only web chat or enable a talking head for a more humanized conversation with a Digital Employee.

When communicating with the Talking Head, you can type your messages or click the microphone icon to speak to your Newo Digital Employee. The Talking Head integration uses the OpenAI API to convert your speech to text. For this to work, you need an OpenAI API key to use the Talking Head integration. Not sure where to find that? Here’s a [quick guide](https://docs.newo.ai/docs/openai-api-keys). Once you have the API key, follow the steps below within the Newo platform:

1.  Navigate to the Integrations page from the left-side panel.
2.  Click the **gear** icon on the "Talking Head" item.
3.  Add your "OpenAI API Key."
4.  Click **Save**.

You will need to specify a HeyGen API key to enable the Talking Head functionality. Here’s how to get one:

1.  Navigate to the [HeyGen website](https://heygen.ai/).
2.  Log in to your account, or sign up for a new one if you don't have one yet.
3.  Once you’ve logged in, navigate to the [API keys page](https://heygen.ai/account/api-keys), where you will find your API key.

1.  Click the **plus** icon on the "Talking Head" item.
2.  Add a "Title" and "Idn." For example, "th\_connector."
3.  Optional: Add a "Greeting Phrase." Although, this is recommended to welcome the user and provide some instructions on how to use the Talking Head. For example, "Hello, what can I assist you with today?"
4.  Toggle "Disable" to have the chat work only in text mode or "Enable" to have Talking Head functionality.
5.  For the "Auto Open After" value, you can specify a time in seconds, after which the Talking Head will be opened automatically. Enter either:
    1.  **\-1** = will never open automatically
    2.  **0** = will open immediately
    3.  **0** >= will open after N seconds. For example, adding "3" would open the Talking Head after 3 seconds.
6.  Add your HeyGen API key if you require the Talking Head functionality; otherwise, leave it empty.
7.  Specify the Voice ID that will be used for the Talking Head. You can find the list of available voices on the [HeyGen website](https://heygen.ai/).
8.  Leave the "Widget Script" empty, as it will be generated automatically after running the connector. You will need this script to add the Talking Head to your website.
9.  Specify the Heygen Avatar that will be used for the Talking Head. You can find the list of available Avatars on the [HeyGen website](https://heygen.ai/).
10.  Leave the "Client Secret" empty, as it will be generated automatically after running the connector. The "Client Secret" is a key that is used to authenticate the Talking Head widget with the Talking Head backend.
11.  For the "Client Website Base URL," you’d want to first set up a demo environment, which you can do by entering the domain where you’ll have the Talking Head, but with some slight modifications.
    1.  Let’s say you want the Talking Head web chat to work on "[https://newo.ai](https://newo.ai/)".
    2.  Add a "-" where there is a "." which, in this case, would be "https://newo-ai".
    3.  Then add ".webchat.newo.ai" to the end.
    4.  The final "Client Website Base URL" would be "[https://newo-ai.webchat.newo.ai](https://newo-ai.webchat.newo.ai/)".
12.  Add a "Color" in HEX (e.g., #FFFFFF), which is the color of the Talking Head icon that will be on your website.
13.  Add an "Agent Name," which will be displayed at the top of the web chat window.
14.  Add an "Agent Picture URL" or leave it empty for the default picture. This picture is used to identify the Digital Employee the user is communicating with.
15.  Click **Save**.

Once a connector is created, you will need to click the Run button to enable the connector, which will also generate the "Widget Script" and "Client Secret" when you open the settings of the connector again.

Testing and debugging are an essential part of the process of creating a Digital Employee. You can test the conversational skills within the Sandbox chat. However, you may want to see how the Talking Head appears on your website without making it live. This is where a demo website comes in handy.

1.  Click the **three dots** icon on the right of the created connector.
2.  Click **Edit Settings**.
3.  Copy the "Client Website Base URL" and paste it into a new browser window/tab with the following additions:
    1.  Add "/?client=" to the end.
    2.  Copy the generated "Client Secret" and paste it at the end (e.g., "[https://newo-ai.webchat.newo.ai/?client=09aec2b1-7122-4570-8538-2b4f0cb5051f"](https://newo-ai.webchat.newo.ai/?client=09aec2b1-7122-4570-8538-2b4f0cb5051f%22).
4.  The URL you entered will open your website with the Talking Head chat icon at the bottom-right corner. You can now test out the functionality in this demo environment before going live.

1.  Click the **three dots** icon on the right of the created connector.
2.  Click **Edit Settings**.
3.  Change the “Client Website Base URL” to your website URL without the modifications made for the demo (e.g., [www.newo.ai](http://www.newo.ai/)).
4.  Copy the generated “Widget Script” to your clipboard and add it to your website's HTML code right before the end of the body tag.
5.  Ensure you **Save** the updated connector.
6.  Publish your website and ensure the Talking Head icon appears at the bottom-right corner of your website.

Updated 4 months ago

* * *
