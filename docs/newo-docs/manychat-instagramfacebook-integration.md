ManyChat (Instagram/Facebook) Integration

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

ManyChat (Instagram/Facebook) Integration

Search

All

Pages

###### Start typing to search…

# ManyChat (Instagram/Facebook) Integration

This guide will walk you through connecting your AI Agent to your Instagram/Facebook accounts to interact with customers reaching our via direct message.

> 👍
> 
> ### 
> 
> Requirements:
> 
> [](#requirements)
> 
> *   Your Newo account needs to be **version 0.4.0-rc-125 or higher** for Instagram/Facebook integration to work. For information on how to check your version, navigate to your Metadata flow.
> *   **ManyChat Pro** account or higher.

> ❗️
> 
> ### 
> 
> Important:
> 
> [](#important)
> 
> It is mandatory that the required channels (Instagram/Facebook) must be activated in ManyChat before proceeding with this guide.
> 
> *   [Connecting Instagram](https://help.manychat.com/hc/en-us/articles/14281290924444-How-to-connect-Instagram-to-Manychat)
> *   [Connecting Facebook](https://help.manychat.com/hc/en-us/articles/14281086119068-How-to-connect-Facebook-to-Manychat)

## 

Installing Templates

[](#installing-templates)

Once you've logged into your ManyChat account, met the above requirements, and have connected your Instagram/Facebook profiles, select one of the templates below that applies to your intended use.

[

Only Instagram

Use this template if you intend on connecting your AI Agent only to Instagram.



](https://app.manychat.com/template/b82448e4453006cdfcd208a543f6e659977314db)[

Only Facebook

Use this template if you intend on connecting your AI Agent only to Facebook.



](https://app.manychat.com/template/a1714eb6ee5487524495daef4aa92e80738d555e)[

Instagram and Facebook

Use this template if you intend on connecting your AI Agent to Instagram AND Facebook.



](https://app.manychat.com/template/a10e96776293b8c4b2e6bd4e633d66fb78b3f815)

Once you've selected one of the above templates, click **Install**.

![](https://files.readme.io/d8b559f91bced4ce4a57f7eb311300c95b53aa892cf65359944ea6c3217ee06f-Xnapper-2025-04-08-14.12.07.png)

Click **Install** next to the ManyChat account where you want to install the template.

![](https://files.readme.io/ea2ad6e25bec8e4b0c1e6eafbf5e35ddcfdb70a3dc6c03070240a28845846e4b-Xnapper-2025-04-08-14.17.00.png)

Click **Install Now**.

![](https://files.readme.io/6b3ab4efa8de87a1ed8cedb3da18e1c75904ad460cfd3a855d2336683f7a6698-Xnapper-2025-04-08-14.19.44.png)

Click **Continue**.

![](https://files.readme.io/01a89637c4c4ce7fa3441dfff79b1d0d2893f7a5359f0309e669684b7c8a5343-Xnapper-2025-04-08-14.23.56.png)

You will need to obtain a Newo API Key from the AI Agent you want to connect to your social accounts. We'll cover where to get this API Key in the next section.

![](https://files.readme.io/61555f8c9c0f5c6071cc231bdd76b68e64a3b5ae2b0efbbf3d0e245be4d2f79d-Xnapper-2025-04-08-14.26.16.png)

## 

Obtaining a Newo API Key

[](#obtaining-a-newo-api-key)

Open a new tab or window in your browser and navigate to the Newo Builder's Integrations page. Find the `webhook` connector under the `API Integration` section, and click on the **three dots** beside it. From the menu, select **Edit Settings**.

![](https://files.readme.io/f7b9cbd21dcb311d4abaa27851b6c8ed1bc344764ebffc40ebfcb9318d0e5fee-Xnapper-2025-04-08-14.31.47.png)

Copy the `Newo API Key`.

![](https://files.readme.io/726d12980ee270d6623e6473dafacbea8d9d5ec0d7c6e88418601905cf34f982-Xnapper-2025-04-08-14.45.25.png)

Paste the API Key into the field on ManyChat and click **Finish**.

![](https://files.readme.io/56fe2446c4c9aee8c359b67e8b92e6685a5282720e059fac930da69530e10e09-Xnapper-2025-04-08-14.46.22.png)

## 

Obtaining a ManyChat API Key

[](#obtaining-a-manychat-api-key)

Navigate to the Settings page in ManyChat.

![](https://files.readme.io/682de9b1b6df568c8eb545ecf0de35f74ccaeaedba00ec2571aa61207a3ffce8-Xnapper-2025-04-08-14.47.49.png)

Scroll down the left-side Settings navigation and click **API**.

![](https://files.readme.io/06a0e6d16f183864750e3a5438c704b5b2f395df766d32438aa1e179916f0b56-Xnapper-2025-04-08-14.48.56.png)

Click the **Generate Your API Key** button. Copy the generated API Key.

![](https://files.readme.io/fb5f2ad7480b5271e227ea0b48d503770e403b567c2855472a69bb97a4d6481d-Xnapper-2025-04-08-14.50.05.png)

Navigate to the Newo Builder's Attributes page and type `Manychat` into the search field. Ensure the `Show Hidden` button is toggled on. Paste the ManyChat API Key into the `project_attributes_setting_manychat_api_token` customer attribute field.

![](https://files.readme.io/bbea8dd6e788bf56015bd88e31e58e837cb0fbfaf4826e12da38c0661435760e-Xnapper-2025-04-08-14.53.41.png)

Click **Save** under the field and **Publish Agent** at the top-right corner of the screen.

## 

Testing the AI Agent Functionality

[](#testing-the-ai-agent-functionality)

Testing is simple. Send a direct message to your linked social account and wait for a response from your AI Agent. That's it! 🎉

Updated 4 months ago

* * *
