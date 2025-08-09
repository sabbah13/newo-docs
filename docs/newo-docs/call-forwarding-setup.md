Call Forwarding Setup

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Call Forwarding Setup

Search

All

Pages

###### Start typing to search…

# Call Forwarding Setup

This guide will walk through enabling seamless hand-off after two rings so that your AI Agent answers on the third ring, without losing callers.

### 

How It Works

[](#how-it-works)

1.  Your phone rings twice (≈ 10 seconds).
2.  If unanswered, the call is automatically forwarded to an AI Agent.
3.  The AI Agent answers on the third ring and handles the caller.

### 

Before You Start

[](#before-you-start)

| Requirement | Why it matters |
| --- | --- |
| AI Agent number | Used in all forwarding scenarios. |
| A mobile plan that supports call-forwarding codes | Most carriers allow these commands. |

### 

GSM Networks (T-Mobile, AT&T, Mint, US Mobile, Google Fi, etc.)

[](#gsm-networks-t-mobile-att-mint-us-mobile-google-fi-etc)

| Action | Dial Code | Example |
| --- | --- | --- |
| To active delayed forwarding (\*10 sec) | `**61*ASSISTANT_NUMBER**10#` → Press Call | `**61*+15551234567**10#` → Press Call |
| To disable delayed forwarding | `##61#` → Press Call | N/A |
| To check the current status | `*#61#` → Press Call | N/A |
| To reset all forwarding settings | `##002#` → Press Call | N/A |

> \***Valid delay options: 5, 10, 15 seconds**

### 

Verizon (CDMA Network)

[](#verizon-cdma-network)

> Verizon does **not** support delayed forwarding via dial codes. Choose one option below.

#### 

Option A – Immediate Forwarding

[](#option-a--immediate-forwarding)

| Action | Dial Code | Example |
| --- | --- | --- |
| To activate | `*72ASSISTANT_NUMBER` → Press Call | `*72+15551234567` → Press Call |
| To disable | `*73` → Press Call | N/A |

#### 

Option B – Delayed Forwarding in My Verizon

[](#option-b--delayed-forwarding-in-my-verizon)

1.  Sign in to your **My Verizon** account.
2.  Navigate to **Call Forwarding**.
3.  Set up forwarding to the AI Agent number if there is no answer after 10 seconds or call Verizon at **+1 (800) 922-0204** for support.

### 

Testing Your Setup

[](#testing-your-setup)

1.  Use another phone to call your number.
2.  Let it ring twice.
3.  Confirm that the third ring is answered by your AI Agent.

If your AI Agent does not answer, verify that:

*   The correct **AI Agent number** was entered.
*   The delay is set to **10 s** (or your chosen interval).
*   Forwarding is still active (`*#61#` for GSM).

### 

Troubleshooting

[](#troubleshooting)

| Symptom | Possible Cause | Fix |
| --- | --- | --- |
| Calls never forward | Forwarding not activated | Redial the code. |
| Forwarding is instant (no rings) | Immediate forwarding code used | Cancel (`##61#` or `*73` depending on your network), then set delayed forwarding. |
| "Connection problem or invalid MMI code" message | Carrier does not support dial code | Configure forwarding in the carrier's app or web portal. |

Updated 3 months ago

* * *
