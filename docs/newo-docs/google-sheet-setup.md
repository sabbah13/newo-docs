Google Sheet Setup

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Google Sheet Setup

Search

All

Pages

###### Start typing to search…

# Google Sheet Setup

## 

Step 1: Prepare the Google Sheet

[](#step-1-prepare-the-google-sheet)

If you’ve created an agent using the [Agent Creator](https://agent.newo.ai/creator), you will need access to the base [Client Session Logs Google Sheet](https://docs.google.com/spreadsheets/d/1kBZ36vAKCe5_IdY845-_-CtmBa9U7FrLE3tvu4hNabE/edit?usp=sharing).

1.  Click **File** in the top tab of the Google Sheet and click **Make a copy**.

![](https://files.readme.io/e9563e374ad7ad909b58bb2ea40f6d0aca6375ac960250fda4c84081f8a7fdbe-Screenshot_2024-11-25_at_15.42.52.png)

2.  Change the document's name (if needed) and click **Make a copy**.

![](https://files.readme.io/b96bc0c77440cec2f82097385d46dc47ccadec53a91ec79c851182efd9ffa163-Screenshot_2024-11-25_at_15.48.59.png)

You should now be able to edit your copy of the Google Sheet.

## 

Step 2: Configure Apps Script

[](#step-2-configure-apps-script)

1.  Click **Extensions** in the top tab of the Google Sheet and click **Apps Script**.

![](https://files.readme.io/bcb90f13251164593f47d5174f09e0aaf6a2be15dd079ee5c3fa301fa31a64b8-Screenshot_2024-11-25_at_15.56.49.png)

2.  Click **Deploy** in the top-right corner and select **New deployment**.

![](https://files.readme.io/1c62d092b40d77655c04b2a3556b991fbe2dcf7de833f8edc2bd3043a683ab8c-Screenshot_2024-11-25_at_15.59.15.png)

3.  Click the **gear icon** next to “Select type” and click **Web app**.

![](https://files.readme.io/81ea22bcc231fc33db8a9798d05f3e8993362d793a38a3a8f5eb456c5f627d9c-Screenshot_2024-11-25_at_16.01.27.png)

4.  In the configuration settings:

*   Description: Add a brief description (e.g., business name or app purpose).
*   Execute as: Choose your account.
*   Who has access: Select **Anyone**.

![](https://files.readme.io/05ca31a7e3f765c4c80e8ae53d038015a1d488ceb97e3a62035e05d1ecbfbe78-Screenshot_2024-11-25_at_16.01.57.png)

5.  Click **Deploy**.

![](https://files.readme.io/0e56e24fef018cd85227b9d9c002b50e1fbf6b543cf0f3c7d69112529a428c7b-Screenshot_2024-11-25_at_16.02.22.png)

6.  Click **Authorize access** and sign into the account you selected in step 4.

![](https://files.readme.io/665dca52a270c7b9fb0602f23ae1102b9f6d6b1715ed42c9ac1322102029d069-Screenshot_2024-11-25_at_16.06.59.png)

7.  After deployment, click **Copy** to copy the generated Web app URL to your clipboard.

![](https://files.readme.io/79e39211b6030eea0e1294e1f86b1d7c53ca5ef7fc70a4c927c9a0116bd666f1-Screenshot_2024-11-25_at_16.07.46.png)

8.  Click **Done** to close the pop-up window.

## 

Step 3: Add the Webhook to the Newo.ai Platform

[](#step-3-add-the-webhook-to-the-newoai-platform)

Let’s connect the Google Sheet to the Newo Platform using the webhook previously created:

1.  Navigate to the [Integrations page](https://builder.newo.ai/integrations).
2.  Under the “API Integration” section, click the **three dots** next to the “webhook” connector and select **Webhooks**.

![](https://files.readme.io/5d3e9df67fa5708aca5988579bb5c1842f201693c8b47bbfe087b450c6c2341d-Screenshot_2024-11-18_at_21.43.21.png)

3.  Click **\+ Add Webhook**.

![](https://files.readme.io/3cee408cb8bd8d819b1542e4e0526f46a12fdab0a6c8d74369fe4546d188f01b-Screenshot_2024-11-25_at_16.40.08.png)

4.  Set any "Idn" (for example, “call\_table\_url”).
5.  Paste the copied URL from the Google Sheet App Script into the “URL” field.
6.  Add the following in the “Commands” field:
    *   get\_contact\_details
    *   update\_inbound\_record
    *   update\_outbound\_record

## 

Step 4: Add the API Key to the Google Sheet

[](#step-4-add-the-api-key-to-the-google-sheet)

The final step involves transferring the API key to the Google Sheet by doing the following:

1.  Navigate to the [Integrations page](https://builder.newo.ai/integrations).
2.  Under the “API Integration” section, click the **three dots** next to the “webhook” connector and select **Edit Settings**.

![](https://files.readme.io/6c28309190ae2cbe241ece9b583202132eb86d6a399a56556084bae3950b8290-Screenshot_2024-11-25_at_16.48.47.png)

3.  Copy the “Newo.ai API Key” and paste it into the Google Sheet in cell B5 of the “Meta” tab.

![](https://files.readme.io/9fb37f4492b952a3af735fa37ae263313c811b265294eec14cd31146e2f5fca3-Screenshot_2024-11-18_at_21.43.47.png) ![](https://files.readme.io/a74d223ddb31501d149159ebddc278031e34551effdd4e120ea1b7c4a3a3485f-Screenshot_2024-11-18_at_21.45.28.png)

Updated 4 months ago

* * *
