Testing Inbound Call Logs

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Testing Inbound Call Logs

Search

All

Pages

###### Start typing to search…

# Testing Inbound Call Logs

Provided everything has been set up correctly, you should be able to call the AI agent number, have a conversation, and, at the end of the call, the information should populate in the "Sessions" tab of the Client Sessions Log Google Sheet.

1.  Navigate to the [Integrations page](https://builder.newo.ai/integrations) on the Newo.ai platform.
2.  Ensure the "vapi\_caller" item under the "Vapi Integration" section indicates that it is "Running."

![](https://files.readme.io/d689eae169d426520ac474bd74ec770ebc42c5420e4b9ef9de2c6802fe1f7532-Screenshot_2024-11-25_at_16.51.28.png)

3.  Click the **three dots** next to the "vapi\_caller" item and click **Edit Settings**.

![](https://files.readme.io/eba3873e0acc430430efd70f6ba8d79c46d990fa1d7b0af00faba025818c91a5-Screenshot_2024-11-25_at_16.52.06.png)

4.  Call the number populated in the "Phone Number" field and converse with your agent.
5.  Once the call has ended, wait a few minutes and then view the "Sessions" tab of the Client Sessions Log Google Sheet to see the details of your conversation populated on the next available empty row.

Updated 4 months ago

* * *
