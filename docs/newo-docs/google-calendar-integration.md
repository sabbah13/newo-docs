Google Calendar Integration

[Jump to Content](#content)

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

[Home](/)[Documentation](/docs)[API Reference](/reference)

* * *

[![Newo](https://files.readme.io/895bdeef8322f081f6d0f4507a17e414930dfddfddf1de452f458dc00698ca84-small-svgviewer-png-output_9.png)](/)

Documentation

Google Calendar Integration

Search

All

Pages

###### Start typing to search…

# Google Calendar Integration

The Google Calendar Integration allows your agent to set up a meeting with a user. The integration comes out-of-the-box but can be turned on or off.

### 

Enable Meeting Creation

[](#enable-meeting-creation)

Before you can schedule meetings via Google Calendar, you must enable meeting creation:

1.  Navigate to Attributes page from the left-side panel.
2.  Use the search field to find the `project_attributes_setting_meeting_creation_enabled` attribute.
3.  Set the attribute value to `True.`
4.  Click **Save**.

### 

Create/Run the Google Calendar Connector

[](#createrun-the-google-calendar-connector)

1.  Navigate to the Integrations page from the left-side panel.
2.  If a Google Calendar connector has not been created yet:
    1.  Click the **plus** icon.
    2.  Add a `Title` and `Idn` as `calendar.`
    3.  Click **Save** and move to the next step.
3.  If a Google Calendar connector has already been created, but the status is `Stopped`, click the **three dots** icon next to the connector and click **Run**. The status will change to `Running`.

### 

Add New Instructions

[](#add-new-instructions)

Now that the Google Calendar integration is running, you can have your agent set up meetings with your users by explicitly stating it and asking for their details within a conversation. You can add these instructions within the flow of your `AGENT_MAIN_INSTRUCTION` where you'd like the agent to book a meeting.

See the example instructions below. Note the information needed from the User.

```
Tell the User that you will send them an SMS and ask them to reply with their **business** email. Wait for the User’s email to appear in the conversation, and until then, let the user know that you are waiting for their business email. Once the email appears in the conversation, see if it is a **business email** and continue. If it is **non-business email** respond with a polite message explaining that only business emails are accepted for scheduling and request a valid business email address.

If the User provided a **business email**, say, "Let’s set up that demo call for you. What time works for you? You can choose any hour from 9 am to 1 pm Eastern Time from Monday to Friday."

(If the user mentioned the day of the week or something like "the day after tomorrow," "tomorrow,” "next [day_of_week]," or "this [day_of_week]," use the 'ConvoAgent CALENDAR' to define provided preferred date and ask: "Do you mean [such-and-such date]?" (Example: "Do you mean 1st of May?"). Ensure you confirm the date the User provides). Important: If a user selects today’s date, a weekend date, or a public holiday, let the User know that these dates are not available and ask to suggest another day."
```

Updated 4 months ago

* * *
