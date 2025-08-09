Newo Chat Integration (Live Agent)

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Newo Chat Integration (Live Agent)

Search

All

Pages

###### Start typing to search…

# Newo Chat Integration (Live Agent)

Unlike the Talking Head integration, which also includes a text-only option, the Newo Chat integration is only text. This integration enables a Digital Employee to communicate through web chat. The below steps highlight the process for **publishing the Newo Chat** on a website. If you're looking to demo an Agent on a website, go [here](newo-chat-integration-demo.md).

## 

Enable the Newo Chat Connector

[](#enable-the-newo-chat-connector)

The connector should automatically be running. If not, and you see the status as `Stopped`, you will need to enable it.

1.  Navigate to the [Integrations page](https://builder.newo.ai/integrations) from the left-side panel.
2.  Click the **three dots** icon on the right of the `newo_chat` connector.

![](https://files.readme.io/e32fce901f6d0853971592ac3b357c88af4b01095da0833065199f94d4883380-Xnapper-2025-03-25-11.28.15.png)

3.  Click **Run**. The status will change to `Running`.

![](https://files.readme.io/c3e59769d247dc05003a4fc25e3b579f21106ac9d089ec6b830348c151ab2620-Xnapper-2025-03-25-11.29.02.png)

## 

Newo Chat Settings

[](#newo-chat-settings)

In most cases, you will have created an agent using the Agent Creator. As a result, there should be `newo_chat` connector available. Click the **three dots** icon next to it and click **Edit Settings**. The following settings can be changed:

*   `Agent Name`: Displayed at the top of the web chat window.

![](https://files.readme.io/3f19af20306ec364630299d2bd66984d8d7a3a13b4baf11ea2dd2654cb3c8357-Xnapper-2025-03-25-11.03.39.png)

*   `Agent Picture URL`: Leave it empty for the default picture. This picture is used to identify the Digital Employee the user is communicating with. Ensure you use a publicly available URL.
*   `Auto Open After`: Determines when/if the Newo Chat will open. Enter either:
    *   **\-1** = will never open.
    *   **0** = will open immediately on page load.
    *   **0** >= will open after `N` seconds. For example, adding `3` would open the Newo Chat after 3 seconds.
*   `Bubble Text`: The bubble text is shown before opening the Newo Chat.

![](https://files.readme.io/8866402daa1e64bdedcc0a5349cac55caa6fb79d65ea418d2a1f3bcf49189b13-Xnapper-2025-03-25-11.24.541.png)

*   `Client Secret`: Generated automatically after running the connector. It is used within the Widget Script to authenticate the Newo Chat widget.
*   `Client Website Base URL`: Enter the base domain of the website where you will be adding the Newo Chat. For example: [https://www.mysite.com](http://www.mysite.com). Ensure you include `https://` in your URL.
*   `Color`: Enter a color in HEX (e.g., #FFFFFF), which will be the color of the Newo Chat icon on your website. Change the color to match your brand.
*   `Greeting Phrase`: The phrase used to welcome the user. For example, "Hello, what can I assist you with today?"

![](https://files.readme.io/e9ff798c5c4ed599eafca1149930209f34ddd4381f3bffe3161611a587e7c413-Xnapper-2025-03-25-11.03.40.png)

*   `Icon Position X`: You can use this setting to shift the icon by a certain number of pixels on the X-axis (horizontally) relative to the bottom-right corner of the screen.
*   `Icon Position Y`: You can use this setting to shift the icon by a certain number of pixels on the Y-axis (vertically) relative to the bottom-right corner of the screen.
*   `Show-case Status`: Ensure this is disabled. This setting should only be enabled when [demoing the agent](newo-chat-integration-demo.md) on a website.
*   `Widget Script`: Generated automatically after running the connector. You will use this script to add the Newo Chat to your website.

Ensure you click **Save** after making any changes to the above settings.

## 

Going Live! Add Code to a Website

[](#going-live-add-code-to-a-website)

1.  Click the **three dots** icon on the right of the created connector.

![](https://files.readme.io/32e79d4928afa0a19a7781a8c24adc0c45b45e866c1438e74ea57ad71ed00ae4-Xnapper-2025-03-25-11.30.07.png)

2.  Click **Edit Settings**.

![](https://files.readme.io/b74b60c9cf17a1fb0c94d18c30c163fa366d8e8320800c3b27c8b08ca10c8251-Xnapper-2025-03-25-11.30.52.png)

3.  If you previously demoed the Agent, ensure your `Client Website Base URL` is set back to just the URL of the website. For example, `https://example.com`. There is no need to replace the `.` with `-` in this case.
4.  Copy the generated `Widget Script` to your clipboard and add it to your website's HTML code right before the end of the body tag (i.e., footer section). Example: `<body> ... [add widget script here]</body>`
5.  Ensure you **Save** the updated connector.
6.  Publish your website and ensure the Newo Chat icon appears at the bottom-right corner of your website.

Updated 4 months ago

* * *
