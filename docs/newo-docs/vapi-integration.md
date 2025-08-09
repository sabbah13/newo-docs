Vapi Integration

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Vapi Integration

Search

All

Pages

###### Start typing to search…

# Vapi Integration

Vapi integration allows for more realistic telephone calls and can easily be implemented on existing agents from past examples in just a few steps. For more information on Vapi, visit their website [here](https://vapi.ai/).

### 

Vapi Account Creation

[](#vapi-account-creation)

1.  Navigate [here](https://dashboard.vapi.ai/) and sign up to use Vapi.
2.  Once you've created an account, log in and navigate to "Account" on the left-side navigation.
3.  Copy the "API Key" to your clipboard.

![](https://files.readme.io/2afab9b-Screenshot_2024-03-12_at_12.21.12.png)

4.  Navigate to "Billing" on the left-side navigation and add a "Payment Method" allowing you to purchase Vapi credits and set a "Monthly Usage Limit."

> 📘
> 
> ### 
> 
> Without adding a "Payment Method," the Newo system will not be able to purchase a phone number when creating a Vapi integration.
> 
> [](#without-adding-a-payment-method-the-newo-system-will-not-be-able-to-purchase-a-phone-number-when-creating-a-vapi-integration)

### 

Add Vapi Integration Settings

[](#add-vapi-integration-settings)

In order for the Newo.ai platform to communicate with your Vapi account, your API needs to be added.

1.  Navigate to the Integrations page from the left-side panel on the Newo.ai platform.
2.  Click the **gear** icon on the "Vapi Integration" item.
3.  Paste your Vapi "API Key" from your clipboard into the available field.
4.  Click **Save**.

### 

Create a Vapi Connector

[](#create-a-vapi-connector)

A Vapi connector needs to be created, which will be used to create an Event Subscription.

1.  Click the **plus** icon on the "Vapi Integration" item.
2.  Fill in the connector "Title," "Idn" (identifying name), and a custom "Greeting Phrase" for when an agent first speaks to a user. It is advisable to use the format vapi\_\[phone number\] for the "Title" and "Idn" to easily see the number being used for a particular connector. For example, vapi\_6592272513. You can view the generated phone number by opening the Vapi connector settings again after you click **Save**.
3.  Add a "Disclaimer Phrase." The default phrase is "Absolutely. Please note that I am logging our conversation, allow me a couple of seconds of delay in my responses." This phrase is stated after the Greeting Phrase and after a user says something.
4.  Select the "Agent" you want to answer the phone. In this case, you can use an existing agent from past examples (e.g., "Embedded Instructions" or "Embedded Context" agents). If you’re using the Superagent framework, select the ConvoAgent.
5.  In the "Phone Area Code" field, type any US area code to select the area where your phone number should be registered.
6.  Specify the code of the "Language" you want your agent to speak. Use "en-US" for English.
7.  Set the "Enable the end-of-call report" value to "true" if you want the Vapi integration to send you "call\_ended" and "call\_aborted" events.
8.  Copy and paste a "Voice Provider" and "Voice Id" from the supported list below:
    1.  Voice provider "deepgram" supports these voices:
        1.  luna
        2.  stella
        3.  athena
        4.  hera
        5.  orion
        6.  arcas
        7.  perseus
        8.  angus
        9.  orpheus
        10.  asteria
        11.  helios
        12.  zeus
    2.  Voice provider "11labs" supports these voices:
        1.  burt
        2.  marissa
        3.  andrea
        4.  sarah
        5.  phillip
        6.  steve
        7.  joseph
        8.  myra
        9.  paula
        10.  ryan
        11.  drew
        12.  paul
        13.  mrb
        14.  matilda
        15.  mark
    3.  Voice provider "playht" supports these voices:
        1.  jennifer
        2.  melissa
        3.  will
        4.  chris
        5.  matt
        6.  jack
        7.  ruby
        8.  davis
        9.  donna
        10.  michael
9.  Click **Save**.

### 

Enable the Vapi Connector

[](#enable-the-vapi-connector)

Once a connector is created, its status will be "Stopped," and you will need to enable it.

1.  Click the **three dots** icon on the right of the created connector.
2.  Click **Run**.

Newo will automatically add a generated phone number on the Vapi portal. To view the generated phone number that you can call, either view the added number on the Vapi portal or click the **plus** icon again on the newly created Vapi connector.

> 📘
> 
> ### 
> 
> A best practice is to add the generated phone number to your connector title to easily view it when creating an event subscription. Use the format "vapi\_\[phone number\]."
> 
> [](#a-best-practice-is-to-add-the-generated-phone-number-to-your-connector-title-to-easily-view-it-when-creating-an-event-subscription-use-the-format-vapi_phone-number)

Updated 4 months ago

* * *
