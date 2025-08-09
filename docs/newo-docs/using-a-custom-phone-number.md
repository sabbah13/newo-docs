Using a Custom Phone Number

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Using a Custom Phone Number

Search

All

Pages

###### Start typing to search…

# Using a Custom Phone Number

This guide explains how to connect a phone number purchased in your own Twilio account to Newo Voice.

## 

Prerequisites

[](#prerequisites)

| Requirement | Notes |
| --- | --- |
| Access to the Twilio Console | You need the Account SID, Auth Token, and at least one purchased phone number. |
| Access to the Newo Builder | You must be able to edit Integrations settings. |
| Newo Voice connector | Restart capability is required after you update credentials. |

### 

Twilio Console Details

[](#twilio-console-details)

In order to get the Account SID and Auth Token, follow [this guide](https://docs.newo.ai/docs/buying-a-twilio-number#/).

### 

Configure the Newo Voice Integration

[](#configure-the-newo-voice-integration)

1.  Navigate to the Integrations page on the Builder platform.
2.  Click the **gear** icon next to the Newo Voice integration.

![](https://files.readme.io/39cdf2f738eb812b6effaa6d8aa08010427f8ba68dbac1b19e9483f9beef51be-Xnapper-2025-06-19-18.11.13.png)

3.  Paste the Account SID and Auth Token you copied from Twilio into the corresponding fields.

![](https://files.readme.io/39b9a0518d12bce52e7bb61d615ad91a794678d048de9d735bd8fd8f5e5d5a7b-Xnapper-2025-06-19-18.12.28.png)

4.  Click **Save**.

### 

Assign the Twilio Phone Number

[](#assign-the-twilio-phone-number)

1.  On the Integrations page, click the **three dots** icon next to the `newo_voice_connector` item.

![](https://files.readme.io/25abfe0603bfeb84d753b152bcdc74174136ca5a5bb18d45229930c64f1b6da8-Xnapper-2025-06-19-18.14.31.png)

2.  Return to the Twilio Console and copy the E.164 formatted number (e.g., +1 415 555 0123) from Phone Numbers → Manage Numbers.
3.  Paste that number into the `Agent Phone Number` field.

![](https://files.readme.io/13743f918dd94de06df0dac48c2d8df52619c2f83973fcdad4b8b9004253f649-Xnapper-2025-06-19-18.15.43.png)

4.  Click **Save**.

### 

Restart the Connector

[](#restart-the-connector)

The Newo Voice connector must restart to apply the new credentials.

1.  On the Integration pages, click the **three dots** icon next to the `newo_voice_connector` item.

![](https://files.readme.io/b80ef7d84b92df92d9ce28f617959bedf880cc1f96985a46e1a22354d1f58ff9-Xnapper-2025-06-19-18.14.31.png)

2.  Click **Pause** and wait for the status to change from `Running` to `Stopped`.

![](https://files.readme.io/0d6d8a37084053a14edaeba3283101aff05a190f6154d0c3d20007c4b4d58fd7-Xnapper-2025-06-19-18.16.54.png)

3.  Once the status shows as `Stopped`, click the **three dots** icon again and click **Run**.

![](https://files.readme.io/93a2272c3953c43e73b275f4d6c1f4903ea656a709863dafb1b6594c53d49bf5-Xnapper-2025-06-19-18.17.55.png)

4.  Once the status shows as `Running`, you can proceed to test call your Twilio phone number.

Updated about 2 months ago

* * *
