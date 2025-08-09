Website Parsing

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Website Parsing

Search

All

Pages

###### Start typing to search…

# Website Parsing

Parsing a website URL to redirect to the Newo.ai Agent Creator is an alternative to the Google Places Picker widget. Instead of a Google Maps location, you can enter a website, and the Agent Creator will scrape it for context information to build an agent.

Here is the website link you'd parse:

```
https://agent.newo.ai/creator?source=${websiteUrl}&source_type=website
```

You can optionally include a referral parameter, allowing you to track referrals for your agents:

```
https://agent.newo.ai/creator?source=${websiteUrl}&source_type=website&[email protected]
```

## 

Example Implementation

[](#example-implementation)

Below is a complete example of how you would implement the website parsing field on your website:

Updated 4 months ago

* * *
