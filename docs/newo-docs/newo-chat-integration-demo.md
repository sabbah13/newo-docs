Newo Chat Integration (Demo Agent)

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](index.md)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Newo Chat Integration (Demo Agent)

Search

All

Pages

###### Start typing to search…

# Newo Chat Integration (Demo Agent)

Unlike the Talking Head integration, which also includes a text-only option, the Newo Chat integration is only text. This integration enables a Digital Employee to communicate through web chat. The below steps highlight the process for **demoing the Newo Chat** on a website. If you're looking to make the Agent live on a website as well as change settings, go here.

Demoing the Agent allows you to test the web chat functionality on a website without needing to dig into the HTML of the website.

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

Client Website Base URL

[](#client-website-base-url)

1.  Click the **three dots** icon next to the `newo_chat` connector.

![](https://files.readme.io/1a16b0a0421a5bce584240796b7fc7570b0b48d3d9fb389211088088c23e876b-Xnapper-2025-03-25-11.30.07.png)

2.  Click **Edit Settings**.

![](https://files.readme.io/8a04d03b8665fc6708919fcaff2882206e4180dbfcdd6eed99d93fbcdbd9aa3b-Xnapper-2025-03-25-11.30.52.png)

3.  For the `Client Website Base URL`, add the website where you want to demo the Newo Chat, but with some slight modifications.
    1.  Let’s say you want the Newo Chat to work on `https://example.com`. Add a `-` where there is a `.` which, in this case, would be `https://example-com`. Website's that use `www`, would like like this: `https://www-example-com`.
    2.  Add a web chat postfix `.webchat.newo.ai`. For example: `https://www-example-com.webchat.newo.ai`
4.  Enable the `Show-case Status` setting, which allows this demo feature to be turned on.
5.  Click **Save**.

## 

Demo the Newo Chat on a Website

[](#demo-the-newo-chat-on-a-website)

To demo the Newo Chat on your selected website, follow these steps:

1.  Click the **three dots** icon on the right of the created connector.
2.  Click **Edit Settings**.
3.  Copy the `Client Website Base URL` you set previously and paste it into a new browser tab with the following additions:
    1.  Add `/?mode=newochat&client=YOUR_CLIENT_SECRET` to the end.
    2.  Copy the generated `Client Secret` and replace `YOUR CLIENT SECRET`. The final URL for a production account will be, for example, `https://example-com.webchat.newo.ai/?mode=newochat&client=09aea2b1-7112-4370-2528-2b4f0cb5051f`.
4.  The entered URL will open the website with the Newo Chat icon at the bottom-right corner. You can now test out the functionality in this demo environment before going live.

Updated 4 months ago

* * *
