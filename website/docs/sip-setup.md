---
sidebar_position: 9
title: "SIP Setup Guide"
description: "Complete guide for connecting SIP telephony in Newo"
---

# How to Connect SIP in Newo

This guide walks you through the process of setting up SIP (Session Initiation Protocol) connectivity in Newo. Follow these steps to configure your SIP connection properly.

:::info Important
Newo uses standard SIP account registration (not IP trunk). Your SIP provider must provide you with SIP credentials and support standard SIP capabilities. TCP or TLS protocol support is recommended for optimal performance.
:::

## Prerequisites

Before you begin, ensure you have the following:

- **SIP Provider Account** - You must have an active SIP account with your provider
- **Standard SIP Support** - Your provider must support standard SIP capabilities
- **Protocol Support** - TCP or TLS protocol support is recommended (UDP is also supported)
- **Provider Testing** - Ensure your SIP provider has been tested and works correctly
- **Phone Number** - A phone number assigned to your SIP account for caller ID

:::note
Newo does not use IP trunk connections - only standard SIP account registration is supported. No additional configuration or integration is required beyond the SIP credentials.
:::

## Required SIP Credentials

Obtain the following information from your SIP provider:

| Credential | Description |
|------------|-------------|
| **SIP hostname** | The SIP server address with port (e.g., `sip.yourprovider.com:5060`) |
| **SIP username** | Your SIP account username/login credentials |
| **SIP password** | Your SIP account password |
| **SIP caller id** | The phone number assigned to your SIP account |
| **SIP connection type** | Protocol supported by your provider (UDP, TCP, or TLS) |

## Setup Process

### Step-by-Step Configuration

**Step 1: Navigate to Integrations**

Go to your Newo builder interface and click on **"Integrations"** in the left sidebar.

**Step 2: Locate Newo Voice**

Find the **"Newo Voice"** integration in your integrations list.

**Step 3: Access Voice Connector Settings**

Click on the **"newo_voice_connector"** (showing "Running" status) and select the three dots menu, then choose **"Edit Settings"**.

**Step 4: Configure SIP Credentials**

In the "Edit newo_voice_connector Connector Settings" dialog, fill in the following fields:

- **SIP caller id** - Enter your caller ID number
- **SIP connection type** - Select your preferred protocol
- **SIP hostname** - Enter your SIP server address
- **SIP password** - Enter your SIP account password
- **SIP username** - Enter your SIP account username

**Step 5: Enable SIP**

Scroll down in the settings dialog and locate the **"Enable SIP"** option. Change the value from "False" to "True".

**Step 6: Save Configuration**

Save your settings to apply the SIP configuration.

**Step 7: Test the Connection**

Make a test call to your configured SIP caller ID number to verify the setup.

**Step 8: Verification**

If the call connects successfully, your SIP connection is properly configured and ready for use.

## Network Configuration

### IP Address Whitelist Requirements

:::caution Only If Required
Most SIP providers do not require IP whitelisting. Add the following addresses to your provider's whitelist **only if specifically requested by your SIP provider**.
:::

#### NAT Gateway IP (Egress)

```
34.135.75.172
```

#### TURN Server IP Addresses (if needed)

```
34.9.125.3
34.66.205.78
```

The majority of SIP providers do not require IP whitelisting. Only contact your provider about these IP addresses if they specifically mention whitelist requirements for your service.

## SIP Connection Types

:::info Important
You can only use the connection types that your SIP provider supports. Most providers support either TCP or UDP, but not necessarily both. Check with your provider before changing protocols.
:::

### Available Protocols

| Protocol | Description |
|----------|-------------|
| **UDP** (User Datagram Protocol) | Widely supported by most SIP providers, suitable for most voice calls |
| **TCP** (Transmission Control Protocol) | Recommended for Newo, more reliable than UDP, ensures packet delivery |
| **TLS** (Transport Layer Security) | Encrypted connection for enhanced security - use only if your provider supports it |

## Troubleshooting

### Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| **Connection fails** | Verify all SIP credentials are correct in the newo_voice_connector settings |
| **SIP not working** | Ensure "Enable SIP" is set to "True" in the connector settings |
| **No audio** | Check your voice configuration settings and ensure TURN server IP is whitelisted if specifically required by your provider |
| **Registration errors** | Double-check SIP hostname (including port) and verify your provider supports the selected connection type |
| **Protocol issues** | Ensure your provider supports the selected protocol (UDP/TCP/TLS) - you cannot switch to unsupported protocols |
| **Connector not running** | If the newo_voice_connector shows a status other than "Running", check your configuration and restart the connector |

:::tip Support
If you continue to experience issues, contact your SIP provider's technical support team with your configuration details for assistance.
:::

## Security Recommendations

- Use TLS connection type **only if your provider supports it** - verify support before switching
- Regularly update your SIP account passwords
- Monitor call logs for any unauthorized usage
- Ensure your network firewall is properly configured
- Work with reputable SIP providers that have been tested with Newo

## Frequently Asked Questions

### Do phone numbers need to be registered on Newo's server or with the provider?

Phone numbers must be registered with your SIP provider, not on Newo's server. Newo connects to your provider using standard SIP account registration. If you're registering numbers from outside your provider's primary service region, check if your provider requires IP whitelisting.

### Does Newo require trunk registration or IP-based connection?

No, Newo does not use IP trunk connections. Only standard SIP account registration is supported. You need to provide SIP credentials (hostname:port, login/password, phone number) from your provider.

### What configuration is required on the provider side?

No special configuration is required from your provider beyond standard SIP account setup. Your provider must support standard SIP capabilities and preferably TCP or TLS protocols.

### Is any special integration needed?

No additional integration is required. Newo works with standard SIP providers using basic SIP credentials. The main requirement is that your provider supports standard SIP functionality and has been tested for compatibility.

### Do I need to whitelist Newo's IP addresses?

Most SIP providers do not require IP whitelisting. If your provider specifically requests it, whitelist the following Newo IP addresses:

- **NAT gateway (egress):** `34.135.75.172`
- **TURN servers:** `34.9.125.3`, `34.66.205.78`

The majority of providers work without any IP restrictions.

### What's the difference between SIP account and SIP connection?

These terms are often used interchangeably. Your SIP connection is established using your SIP account credentials provided by your provider. Newo creates a SIP connection to your provider using your account details.

## Provider Requirements Summary

For successful Newo SIP integration, ensure your provider:

- Supports standard SIP capabilities
- Provides SIP account credentials (not IP trunk)
- Supports TCP or TLS protocols (recommended)
- Has been tested for compatibility
- Provides reliable service quality

---

## Related Documentation

- [**Integration Guide**](/integration-guide) - General integration patterns
- [**Integration Setup**](/integration-setup) - Setup procedures for other integrations
- [**Troubleshooting**](/troubleshooting) - General troubleshooting guide
